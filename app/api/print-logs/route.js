export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'log.view')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền xem nhật ký in ấn' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parsedLimit = parseInt(searchParams.get('limit') || '50', 10);
    const safeLimit = Math.min(Math.max(1, isNaN(parsedLimit) ? 50 : parsedLimit), 200);

    let sql = `
      SELECT pl.id, pl.printer_name, pl.paper_size, pl.copies, pl.ip_address, pl.status, pl.created_at,
             fr.code AS record_code, fr.title AS record_title,
             t.name AS template_name,
             u.full_name AS user_name, u.username
      FROM print_logs pl
      INNER JOIN form_records fr ON pl.form_record_id = fr.id
      INNER JOIN templates t ON pl.template_id = t.id
      INNER JOIN users u ON pl.user_id = u.id
      ORDER BY pl.created_at DESC
      LIMIT ?
    `;

    const logs = await query(sql, [safeLimit]);
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching print logs:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải nhật ký in' }, { status: 500 });
  }
}
