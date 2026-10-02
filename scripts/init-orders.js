const mysql = require('mysql2/promise');

async function initOrders() {
  console.log('--- Khởi tạo bảng và dữ liệu cho Module Order ---');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phanmemxuatform',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    // 1. Create orders table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_code VARCHAR(50) NOT NULL UNIQUE,
        product_id INT NULL,
        product_code VARCHAR(50) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit VARCHAR(50) DEFAULT 'Cái',
        unit_price DECIMAL(15,2) DEFAULT 0,
        total_amount DECIMAL(15,2) DEFAULT 0,
        customer_name VARCHAR(150) NULL,
        phone VARCHAR(50) NULL,
        note TEXT NULL,
        status ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
        created_by INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_orders_code (order_code),
        INDEX idx_orders_product_code (product_code),
        INDEX idx_orders_status (status),
        INDEX idx_orders_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✔ Đã tạo bảng orders trong CSDL');

    // 2. Register permissions for Order module
    const orderPerms = [
      { id: 19, name: 'Xem danh sách đơn hàng', code: 'order.view', module: 'Orders', description: 'Xem danh sách đơn hàng và chi tiết order' },
      { id: 20, name: 'Tạo mới đơn hàng', code: 'order.create', module: 'Orders', description: 'Tạo đơn hàng mới với autocomplete sản phẩm' },
      { id: 21, name: 'Chỉnh sửa đơn hàng', code: 'order.edit', module: 'Orders', description: 'Cập nhật số lượng, trạng thái đơn hàng' },
      { id: 22, name: 'Hủy / Xóa đơn hàng', code: 'order.delete', module: 'Orders', description: 'Hủy hoặc xóa order khỏi hệ thống' }
    ];

    for (const p of orderPerms) {
      await conn.query(
        `INSERT INTO permissions (id, name, code, module, description) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), module=VALUES(module), description=VALUES(description)`,
        [p.id, p.name, p.code, p.module, p.description]
      );
    }
    console.log('✔ Đã đăng ký 4 quyền cho module Orders');

    // 3. Map permissions to roles
    // Admin (role 1) has all
    for (let pId = 19; pId <= 22; pId++) {
      await conn.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, ?)`, [pId]);
      await conn.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, ?)`, [pId]);
    }
    // Staff (role 3) can view and create
    await conn.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (3, 19)`);
    await conn.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (3, 20)`);
    console.log('✔ Đã gán quyền module Order vào các vai trò Admin, Manager, Staff');

    // 4. Seed sample orders if none exist
    const [existing] = await conn.query('SELECT COUNT(*) as cnt FROM orders');
    if (existing[0].cnt === 0) {
      const sampleOrders = [
        {
          order_code: 'ORD-20261001-0001',
          product_code: 'SP-LT-7420',
          product_name: 'Laptop Dell Latitude 7420 Core i7 / 16GB RAM / 512GB SSD',
          quantity: 2,
          unit: 'Bộ',
          unit_price: 21500000,
          total_amount: 43000000,
          customer_name: 'Phòng Kỹ Thuật Dự Án',
          phone: '0912345678',
          note: 'Cấp phát máy tính cho kỹ sư mới vào dự án',
          status: 'completed',
          created_by: 1
        },
        {
          order_code: 'ORD-20261001-0002',
          product_code: 'SP-GIAY-A4',
          product_name: 'Giấy in Double A A4 70gsm (Thùng 5 Ram)',
          quantity: 10,
          unit: 'Thùng',
          unit_price: 345000,
          total_amount: 3450000,
          customer_name: 'Phòng Hành Chính Tổng Hợp',
          phone: '0987654321',
          note: 'Văn phòng phẩm quý 4/2026',
          status: 'confirmed',
          created_by: 2
        },
        {
          order_code: 'ORD-20261001-0003',
          product_code: 'SP-MUC-HP76A',
          product_name: 'Hộp mực in HP LaserJet 76A (CF276A) chính hãng',
          quantity: 3,
          unit: 'Hộp',
          unit_price: 2450000,
          total_amount: 7350000,
          customer_name: 'Phòng Kế Toán',
          phone: '0933221100',
          note: 'Thay thế mực máy in phòng kế toán',
          status: 'pending',
          created_by: 3
        }
      ];

      for (const ord of sampleOrders) {
        // Find product_id
        const [prod] = await conn.query('SELECT id FROM products WHERE code = ?', [ord.product_code]);
        const prodId = prod.length > 0 ? prod[0].id : null;

        await conn.query(
          `INSERT INTO orders 
           (order_code, product_id, product_code, product_name, quantity, unit, unit_price, total_amount, customer_name, phone, note, status, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ord.order_code, prodId, ord.product_code, ord.product_name, ord.quantity,
            ord.unit, ord.unit_price, ord.total_amount, ord.customer_name, ord.phone,
            ord.note, ord.status, ord.created_by
          ]
        );
      }
      console.log('✔ Đã khởi tạo các đơn hàng mẫu thành công');
    }

    console.log('--- HOÀN TẤT THIẾT LẬP MODULE ORDER ---');
  } finally {
    await conn.end();
  }
}

initOrders().catch(err => {
  console.error('Lỗi khởi tạo module Order:', err);
  process.exit(1);
});
