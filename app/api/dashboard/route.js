export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    const [templatesCount] = await query(`SELECT COUNT(*) AS count FROM templates WHERE status = 'active'`);
    const [recordsCount] = await query(`SELECT COUNT(*) AS count FROM form_records`);
    const [printsCount] = await query(`SELECT COUNT(*) AS count FROM print_logs`);
    const [usersCount] = await query(`SELECT COUNT(*) AS count FROM users WHERE status = 'active'`);
    const [productsCount] = await query(`SELECT COUNT(*) AS count FROM products WHERE status = 'active'`);

    // Staff only sees their own recent records
    let recentRecordsSql = `
      SELECT fr.id, fr.code, fr.title, fr.created_at, fr.print_count,
             t.name AS template_name,
             u.full_name AS created_by_name
      FROM form_records fr
      INNER JOIN templates t ON fr.template_id = t.id
      INNER JOIN users u ON fr.created_by = u.id
    `;
    const recordParams = [];

    if (user.role_code === 'STAFF') {
      recentRecordsSql += ` WHERE fr.created_by = ?`;
      recordParams.push(user.id);
    }

    recentRecordsSql += ` ORDER BY fr.created_at DESC LIMIT 6`;
    const recentRecords = await query(recentRecordsSql, recordParams);

    // Recent prints
    let recentPrintsSql = `
      SELECT pl.id, pl.printer_name, pl.created_at, pl.status,
             fr.code AS record_code, fr.title AS record_title,
             t.name AS template_name,
             u.full_name AS user_name
      FROM print_logs pl
      INNER JOIN form_records fr ON pl.form_record_id = fr.id
      INNER JOIN templates t ON pl.template_id = t.id
      INNER JOIN users u ON pl.user_id = u.id
    `;
    const printParams = [];

    if (user.role_code === 'STAFF') {
      recentPrintsSql += ` WHERE pl.user_id = ?`;
      printParams.push(user.id);
    }

    recentPrintsSql += ` ORDER BY pl.created_at DESC LIMIT 6`;
    const recentPrints = await query(recentPrintsSql, printParams);

    // Top templates
    const topTemplates = await query(`
      SELECT t.id, t.name, t.code, t.file_type,
             COUNT(fr.id) AS usage_count
      FROM templates t
      LEFT JOIN form_records fr ON t.id = fr.template_id
      GROUP BY t.id
      ORDER BY usage_count DESC, t.id ASC
      LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      stats: {
        templates: templatesCount?.count || 0,
        records: recordsCount?.count || 0,
        prints: printsCount?.count || 0,
        users: usersCount?.count || 0,
        products: productsCount?.count || 0
      },
      recent_records: recentRecords,
      recent_prints: recentPrints,
      top_templates: topTemplates
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải dữ liệu bảng điều khiển' }, { status: 500 });
  }
}
