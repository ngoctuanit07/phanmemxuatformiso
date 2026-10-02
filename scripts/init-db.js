const mysql = require('mysql2/promise');

async function initDatabase() {
  console.log('--- Đang khởi tạo cơ sở dữ liệu phanmemxuatform ---');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    // 1. Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`phanmemxuatform\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log('✔ Cơ sở dữ liệu phanmemxuatform đã sẵn sàng.');

    await connection.changeUser({ database: 'phanmemxuatform' });

    // 2. Roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`description\` VARCHAR(255) NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Permissions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`permissions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`code\` VARCHAR(100) NOT NULL UNIQUE,
        \`module\` VARCHAR(50) NOT NULL,
        \`description\` VARCHAR(255) NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Role Permissions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`role_permissions\` (
        \`role_id\` INT NOT NULL,
        \`permission_id\` INT NOT NULL,
        PRIMARY KEY (\`role_id\`, \`permission_id\`),
        FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`full_name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(100) NULL,
        \`phone\` VARCHAR(20) NULL,
        \`department\` VARCHAR(100) NULL,
        \`role_id\` INT NOT NULL,
        \`status\` ENUM('active', 'inactive', 'locked') DEFAULT 'active',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`),
        INDEX \`idx_users_username\` (\`username\`),
        INDEX \`idx_users_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Template Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`template_categories\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`description\` VARCHAR(255) NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Templates table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`templates\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`name\` VARCHAR(200) NOT NULL,
        \`description\` TEXT NULL,
        \`category_id\` INT NULL,
        \`file_path\` VARCHAR(500) NOT NULL,
        \`file_name\` VARCHAR(255) NOT NULL,
        \`file_type\` ENUM('docx', 'pdf') DEFAULT 'docx',
        \`file_size\` BIGINT DEFAULT 0,
        \`fields_schema\` JSON NOT NULL,
        \`version\` INT DEFAULT 1,
        \`status\` ENUM('active', 'draft', 'archived') DEFAULT 'active',
        \`created_by\` INT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`category_id\`) REFERENCES \`template_categories\` (\`id\`) ON DELETE SET NULL,
        FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
        INDEX \`idx_templates_code\` (\`code\`),
        INDEX \`idx_templates_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Form Records table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`form_records\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`template_id\` INT NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`form_data\` JSON NOT NULL,
        \`status\` ENUM('draft', 'completed', 'cancelled') DEFAULT 'completed',
        \`print_count\` INT DEFAULT 0,
        \`last_printed_at\` DATETIME NULL,
        \`created_by\` INT NOT NULL,
        \`updated_by\` INT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`template_id\`) REFERENCES \`templates\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`),
        FOREIGN KEY (\`updated_by\`) REFERENCES \`users\` (\`id\`),
        INDEX \`idx_records_code\` (\`code\`),
        INDEX \`idx_records_template\` (\`template_id\`),
        INDEX \`idx_records_created_by\` (\`created_by\`),
        INDEX \`idx_records_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Print Logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`print_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`form_record_id\` INT NOT NULL,
        \`template_id\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`printer_name\` VARCHAR(100) DEFAULT 'Default Local Printer',
        \`paper_size\` VARCHAR(20) DEFAULT 'A4',
        \`copies\` INT DEFAULT 1,
        \`ip_address\` VARCHAR(50) NULL,
        \`user_agent\` VARCHAR(255) NULL,
        \`status\` ENUM('success', 'failed') DEFAULT 'success',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`form_record_id\`) REFERENCES \`form_records\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`template_id\`) REFERENCES \`templates\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`),
        INDEX \`idx_print_logs_record\` (\`form_record_id\`),
        INDEX \`idx_print_logs_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. Audit Logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NULL,
        \`action\` VARCHAR(100) NOT NULL,
        \`entity\` VARCHAR(50) NOT NULL,
        \`entity_id\` VARCHAR(50) NULL,
        \`ip_address\` VARCHAR(50) NULL,
        \`user_agent\` VARCHAR(255) NULL,
        \`details\` JSON NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_audit_user\` (\`user_id\`),
        INDEX \`idx_audit_action\` (\`action\`),
        INDEX \`idx_audit_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 11. System Settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`system_settings\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`setting_key\` VARCHAR(100) NOT NULL UNIQUE,
        \`setting_value\` TEXT NULL,
        \`description\` VARCHAR(255) NULL,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✔ Toàn bộ 10 bảng cơ sở dữ liệu đã được tạo thành công.');
  } catch (err) {
    console.error('Lỗi khởi tạo database:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

initDatabase().catch(err => {
  console.error(err);
  process.exit(1);
});
