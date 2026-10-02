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

    const settings = await query(`SELECT setting_key, setting_value, description FROM system_settings`);
    const settingsMap = {};
    for (const s of settings) {
      settingsMap[s.setting_key] = s.setting_value;
    }

    return NextResponse.json({ success: true, settings: settingsMap, list: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải cấu hình hệ thống' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'setting.manage')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền thay đổi cài đặt hệ thống' }, { status: 403 });
    }

    const { settings } = await request.json();

    if (settings && typeof settings === 'object') {
      for (const [key, value] of Object.entries(settings)) {
        await query(
          `INSERT INTO system_settings (setting_key, setting_value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [key, String(value), String(value)]
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Đã lưu cấu hình hệ thống thành công!' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật cấu hình hệ thống' }, { status: 500 });
  }
}
