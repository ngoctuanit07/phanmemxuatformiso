const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('--- Đang khởi tạo dữ liệu mẫu và phân quyền ---');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phanmemxuatform',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    // 1. Seed Roles
    const roles = [
      { id: 1, name: 'Quản trị viên tối cao', code: 'ADMIN', description: 'Toàn quyền quản trị hệ thống, người dùng, biểu mẫu và in ấn' },
      { id: 2, name: 'Quản lý biểu mẫu', code: 'MANAGER', description: 'Quản lý các template, duyệt và xem toàn bộ dữ liệu form của nhân viên' },
      { id: 3, name: 'Nhân viên nhập liệu', code: 'STAFF', description: 'Nhập dữ liệu vào form, lưu và xuất lệnh in ra máy in' }
    ];

    for (const r of roles) {
      await connection.query(
        `INSERT INTO roles (id, name, code, description) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)`,
        [r.id, r.name, r.code, r.description]
      );
    }
    console.log('✔ Đã khởi tạo các Vai trò (Roles).');

    // 2. Seed Permissions
    const permissions = [
      // Templates
      { id: 1, name: 'Xem danh sách biểu mẫu', code: 'template.view', module: 'Templates', description: 'Quyền xem danh sách các template có sẵn' },
      { id: 2, name: 'Nạp/Tải lên biểu mẫu mới', code: 'template.create', module: 'Templates', description: 'Nạp file Word/PDF template mới vào hệ thống' },
      { id: 3, name: 'Chỉnh sửa cấu hình biểu mẫu', code: 'template.edit', module: 'Templates', description: 'Cấu hình các trường động và thuộc tính template' },
      { id: 4, name: 'Xóa biểu mẫu', code: 'template.delete', module: 'Templates', description: 'Xóa hoặc lưu trữ biểu mẫu' },

      // Records
      { id: 5, name: 'Xem bản ghi form', code: 'record.view', module: 'Records', description: 'Xem danh sách các form đã lưu' },
      { id: 6, name: 'Nhập liệu form mới', code: 'record.create', module: 'Records', description: 'Điền thông tin vào form và lưu vào CSDL' },
      { id: 7, name: 'Chỉnh sửa bản ghi form', code: 'record.edit', module: 'Records', description: 'Chỉnh sửa thông tin form đã lưu' },
      { id: 8, name: 'Xóa bản ghi form', code: 'record.delete', module: 'Records', description: 'Xóa bản ghi form' },
      { id: 9, name: 'Xuất PDF và In ấn', code: 'record.print', module: 'Records', description: 'Xuất file PDF từ template và gửi lệnh in ra máy in local' },

      // Users & Roles
      { id: 10, name: 'Xem danh sách người dùng', code: 'user.view', module: 'Users', description: 'Xem danh sách người dùng' },
      { id: 11, name: 'Quản lý người dùng', code: 'user.manage', module: 'Users', description: 'Thêm, sửa, khóa người dùng' },
      { id: 12, name: 'Quản lý phân quyền', code: 'role.manage', module: 'Roles', description: 'Thiết lập quyền hạn cho từng vai trò' },

      // Logs & Settings
      { id: 13, name: 'Xem nhật ký in ấn & kiểm tra', code: 'log.view', module: 'Logs', description: 'Xem lịch sử in ấn của các thành viên' },
      { id: 14, name: 'Cấu hình hệ thống', code: 'setting.manage', module: 'Settings', description: 'Cấu hình máy in, thông tin cơ quan' }
    ];

    for (const p of permissions) {
      await connection.query(
        `INSERT INTO permissions (id, name, code, module, description) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), module=VALUES(module), description=VALUES(description)`,
        [p.id, p.name, p.code, p.module, p.description]
      );
    }
    console.log('✔ Đã khởi tạo danh mục Quyền hạn (Permissions).');

    // 3. Assign Permissions to Roles
    // Admin gets all permissions (1..14)
    for (let pId = 1; pId <= 14; pId++) {
      await connection.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, ?)`, [pId]);
    }

    // Manager gets template management, all record actions, print, log view
    const managerPerms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13];
    for (const pId of managerPerms) {
      await connection.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, ?)`, [pId]);
    }

    // Staff gets template view, record create, record edit own, record print
    const staffPerms = [1, 5, 6, 7, 9];
    for (const pId of staffPerms) {
      await connection.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (3, ?)`, [pId]);
    }
    console.log('✔ Đã gán quyền tương ứng cho từng vai trò.');

    // 4. Seed Users
    const passwordHash = await bcrypt.hash('admin123', 10);
    const users = [
      {
        username: 'admin',
        password_hash: passwordHash,
        full_name: 'Quản trị viên Hệ Thống',
        email: 'admin@phanmemxuatform.vn',
        phone: '0901234567',
        department: 'Ban Giám Đốc / CNTT',
        role_id: 1,
        status: 'active'
      },
      {
        username: 'manager',
        password_hash: await bcrypt.hash('manager123', 10),
        full_name: 'Nguyễn Văn Quản Lý',
        email: 'manager@phanmemxuatform.vn',
        phone: '0912345678',
        department: 'Phòng Hành Chính Nhân Sự',
        role_id: 2,
        status: 'active'
      },
      {
        username: 'nhanvien',
        password_hash: await bcrypt.hash('nhanvien123', 10),
        full_name: 'Trần Thị Nhân Viên',
        email: 'nhanvien@phanmemxuatform.vn',
        phone: '0923456789',
        department: 'Phòng Kế Toán & Vận Hành',
        role_id: 3,
        status: 'active'
      }
    ];

    for (const u of users) {
      await connection.query(
        `INSERT INTO users (username, password_hash, full_name, email, phone, department, role_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), email=VALUES(email), role_id=VALUES(role_id)`,
        [u.username, u.password_hash, u.full_name, u.email, u.phone, u.department, u.role_id, u.status]
      );
    }
    console.log('✔ Đã khởi tạo người dùng mặc định: admin, manager, nhanvien.');

    // 5. Seed Template Categories
    const categories = [
      { id: 1, name: 'Hành chính & Nhân sự', code: 'HCNS', description: 'Các biểu mẫu đơn từ, nghỉ phép, đề xuất nhân sự' },
      { id: 2, name: 'Kế toán & Tài chính', code: 'KTTC', description: 'Giấy đề nghị thanh toán, tạm ứng, quyết toán' },
      { id: 3, name: 'Biên bản & Giao nhận', code: 'BBGN', description: 'Biên bản bàn giao tài sản, nghiệm thu, giao việc' },
      { id: 4, name: 'Kỹ thuật & Vận hành', code: 'KTVH', description: 'Phiếu yêu cầu kỹ thuật, bảo trì thiết bị' }
    ];

    for (const c of categories) {
      await connection.query(
        `INSERT INTO template_categories (id, name, code, description) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)`,
        [c.id, c.name, c.code, c.description]
      );
    }

    // 6. Seed System Settings
    const settings = [
      { key: 'company_name', val: 'TẬP ĐOÀN CÔNG NGHỆ VÀ TRUYỀN THÔNG ĐÔNG Á', desc: 'Tên đơn vị/cơ quan in trên biểu mẫu' },
      { key: 'company_address', val: 'Tòa nhà Innovation, 123 Đường Công Nghệ, Q. Cầu Giấy, Hà Nội', desc: 'Địa chỉ đơn vị' },
      { key: 'company_phone', val: '024.3888.9999', desc: 'Hotline cơ quan' },
      { key: 'default_paper_size', val: 'A4', desc: 'Khổ giấy in mặc định' },
      { key: 'default_printer', val: 'Local Default Printer', desc: 'Máy in mặc định hệ thống' },
      { key: 'auto_print_dialog', val: 'true', desc: 'Tự động mở hộp thoại in của máy in sau khi nạp form' }
    ];

    for (const s of settings) {
      await connection.query(
        `INSERT INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), description=VALUES(description)`,
        [s.key, s.val, s.desc]
      );
    }
    console.log('✔ Đã khởi tạo cấu hình hệ thống.');

    console.log('--- KHỞI TẠO DỮ LIỆU HOÀN TẤT ---');
  } catch (err) {
    console.error('Lỗi seed data:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

seedDatabase().catch(err => {
  console.error(err);
  process.exit(1);
});
