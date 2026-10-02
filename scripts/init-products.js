const mysql = require('mysql2/promise');

async function initProducts() {
  console.log('--- Khởi tạo bảng danh mục và sản phẩm ---');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phanmemxuatform',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    // 1. Create product_categories table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        description VARCHAR(255) NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✔ Đã tạo bảng product_categories');

    // 2. Create products table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        category_id INT NULL,
        unit VARCHAR(50) DEFAULT 'Cái',
        price DECIMAL(15,2) DEFAULT 0,
        description TEXT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
        INDEX idx_products_code (code),
        INDEX idx_products_category (category_id),
        INDEX idx_products_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✔ Đã tạo bảng products');

    // 3. Register permissions for products module
    const productPerms = [
      { id: 15, name: 'Xem danh sách sản phẩm & danh mục', code: 'product.view', module: 'Products', description: 'Xem danh sách sản phẩm và danh mục hàng hóa' },
      { id: 16, name: 'Thêm mới sản phẩm & danh mục', code: 'product.create', module: 'Products', description: 'Tạo mã sản phẩm và danh mục mới' },
      { id: 17, name: 'Chỉnh sửa sản phẩm & danh mục', code: 'product.edit', module: 'Products', description: 'Cập nhật mã code, tên và thuộc tính sản phẩm' },
      { id: 18, name: 'Xóa sản phẩm & danh mục', code: 'product.delete', module: 'Products', description: 'Xóa sản phẩm hoặc danh mục khỏi hệ thống' }
    ];

    for (const p of productPerms) {
      await conn.query(
        `INSERT INTO permissions (id, name, code, module, description) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), module=VALUES(module), description=VALUES(description)`,
        [p.id, p.name, p.code, p.module, p.description]
      );
    }
    console.log('✔ Đã đăng ký 4 quyền cho module Products');

    // 4. Map permissions to roles
    for (let pId = 15; pId <= 18; pId++) {
      await conn.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, ?)`, [pId]);
      await conn.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, ?)`, [pId]);
    }
    await conn.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (3, 15)`);
    console.log('✔ Đã gán quyền module sản phẩm vào các vai trò');

    // 5. Seed sample product categories
    const categories = [
      { code: 'CAT-IT', name: 'Thiết Bị CNTT & Phần Cứng', description: 'Laptop, PC, Màn hình, Thiết bị ngoại vi văn phòng' },
      { code: 'CAT-VPP', name: 'Văn Phòng Phẩm & Tiêu Hao', description: 'Giấy in, mực in, bút, tài liệu văn phòng' },
      { code: 'CAT-VT', name: 'Vật Tư & Linh Kiện Kỹ Thuật', description: 'Dây cáp mạng, switch, linh kiện máy tính' },
      { code: 'CAT-SOFT', name: 'Phần Mềm & Bản Quyền', description: 'Hệ điều hành Windows, Office 365, Diệt virus' }
    ];

    for (const cat of categories) {
      await conn.query(
        `INSERT INTO product_categories (code, name, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)`,
        [cat.code, cat.name, cat.description]
      );
    }
    console.log('✔ Đã tạo các danh mục sản phẩm mẫu');

    // 6. Seed sample products
    const products = [
      { code: 'SP-LT-7420', name: 'Laptop Dell Latitude 7420 Core i7 / 16GB RAM / 512GB SSD', category_code: 'CAT-IT', unit: 'Bộ', price: 21500000, description: 'Dành cho nhân sự văn phòng và kỹ sư vận hành' },
      { code: 'SP-MH-U2422', name: 'Màn hình Dell UltraSharp 24 inch IPS U2422H FHD', category_code: 'CAT-IT', unit: 'Chiếc', price: 5490000, description: 'Màn hình chuyên đồ họa và văn phòng chống mỏi mắt' },
      { code: 'SP-LOGI-M3S', name: 'Chuột không dây Logitech MX Master 3S Silent', category_code: 'CAT-IT', unit: 'Chiếc', price: 2190000, description: 'Chuột Bluetooth cao cấp hỗ trợ cuộn siêu tốc' },
      { code: 'SP-KB-K2PRO', name: 'Bàn phím cơ không dây Keychron K2 Pro QMK/VIA', category_code: 'CAT-IT', unit: 'Chiếc', price: 2350000, description: 'Hotswap RGB Red switch kết nối 3 thiết bị' },
      { code: 'SP-GIAY-A4', name: 'Giấy in Double A A4 70gsm (Thùng 5 Ram)', category_code: 'CAT-VPP', unit: 'Thùng', price: 345000, description: 'Giấy trắng đẹp độ mịn cao dùng cho máy in và photo' },
      { code: 'SP-MUC-HP76A', name: 'Hộp mực in HP LaserJet 76A (CF276A) chính hãng', category_code: 'CAT-VPP', unit: 'Hộp', price: 2450000, description: 'Dung lượng in 3.000 trang cho máy in HP M404' },
      { code: 'SP-M365-BUS', name: 'Bản quyền Microsoft 365 Business Standard (1 năm)', category_code: 'CAT-SOFT', unit: 'Gói', price: 3120000, description: 'Word, Excel, PowerPoint, Outlook, Teams, 1TB OneDrive' },
      { code: 'SP-KASP-END', name: 'Phần mềm diệt virus Kaspersky Endpoint Security for Business', category_code: 'CAT-SOFT', unit: 'License', price: 650000, description: 'Bảo vệ máy trạm văn phòng thời hạn 1 năm' }
    ];

    for (const p of products) {
      const [catRows] = await conn.query('SELECT id FROM product_categories WHERE code = ?', [p.category_code]);
      const catId = catRows.length > 0 ? catRows[0].id : null;

      await conn.query(
        `INSERT INTO products (code, name, category_id, unit, price, description)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), category_id=VALUES(category_id), unit=VALUES(unit), price=VALUES(price), description=VALUES(description)`,
        [p.code, p.name, catId, p.unit, p.price, p.description]
      );
    }
    console.log('✔ Đã khởi tạo các sản phẩm mẫu thành công');

    console.log('--- HOÀN TẤT THIẾT LẬP MODULE SẢN PHẨM ---');
  } finally {
    await conn.end();
  }
}

initProducts().catch(err => {
  console.error('Lỗi khởi tạo sản phẩm:', err);
  process.exit(1);
});
