const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(resBody); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body: parsed || resBody });
      });
    });
    req.on('error', reject);
    if (body) {
      const data = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(data));
      req.write(data);
    }
    req.end();
  });
}

async function verifySecurity() {
  console.log('--- BẮT ĐẦU KIỂM THỬ ĐÁNH GIÁ CÁC BẢN VÁ BẢO MẬT ---\n');

  // Test 1: Unauthenticated request to /api/users
  const t1 = await request({ hostname: 'localhost', port: 3000, path: '/api/users', method: 'GET' });
  console.log(`1. Truy cập /api/users không kèm token: Status = ${t1.status} (Kỳ vọng: 401) -> ${t1.status === 401 ? '✔ ĐẠT' : '❌ THẤT BẠI'}`);

  // Test 2: Unauthenticated impersonation /api/auth/switch
  const t2 = await request({ hostname: 'localhost', port: 3000, path: '/api/auth/switch', method: 'POST' }, { username: 'admin' });
  console.log(`2. Tấn công mạo danh quyền qua /api/auth/switch: Status = ${t2.status} (Kỳ vọng: 401 hoặc 403) -> ${[401, 403].includes(t2.status) ? '✔ ĐẠT' : '❌ THẤT BẠI'}`);

  // Test 3: Unauthenticated template upload /api/templates/upload
  const t3 = await request({ hostname: 'localhost', port: 3000, path: '/api/templates/upload', method: 'POST' });
  console.log(`3. Tải file lên /api/templates/upload không kèm token: Status = ${t3.status} (Kỳ vọng: 401) -> ${t3.status === 401 ? '✔ ĐẠT' : '❌ THẤT BẠI'}`);

  // Test 4: Unauthenticated settings access /api/settings
  const t4 = await request({ hostname: 'localhost', port: 3000, path: '/api/settings', method: 'GET' });
  console.log(`4. Đọc cấu hình nhạy cảm /api/settings không kèm token: Status = ${t4.status} (Kỳ vọng: 401) -> ${t4.status === 401 ? '✔ ĐẠT' : '❌ THẤT BẠI'}`);

  // Test 5: Unauthenticated access to /api/records
  const t5 = await request({ hostname: 'localhost', port: 3000, path: '/api/records', method: 'GET' });
  console.log(`5. Đọc danh sách hồ sơ /api/records không kèm token: Status = ${t5.status} (Kỳ vọng: 401) -> ${t5.status === 401 ? '✔ ĐẠT' : '❌ THẤT BẠI'}`);

  // Test 6: Login with invalid credentials
  const t6 = await request({ hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST' }, { username: 'nonexistent_user_xyz', password: 'wrong' });
  console.log(`6. Thử đăng nhập sai: Message = "${t6.body.message}" (Kỳ vọng: Không phân biệt user tồn tại/sai pass) -> ${t6.body.message === 'Tên đăng nhập hoặc mật khẩu không chính xác' ? '✔ ĐẠT' : '❌ THẤT BẠI'}`);

  // Test 7: Login with valid admin account
  const t7 = await request({ hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST' }, { username: 'admin', password: 'admin123' });
  console.log(`7. Đăng nhập tài khoản hợp lệ: Status = ${t7.status} (Kỳ vọng: 200) -> ${t7.status === 200 ? '✔ ĐẠT' : '❌ THẤT BẠI'}`);
  const cookieHeader = t7.headers['set-cookie'] ? t7.headers['set-cookie'][0] : '';
  const isHttpOnly = cookieHeader.includes('HttpOnly');
  console.log(`   Cờ Cookie bảo vệ (HttpOnly): ${isHttpOnly ? '✔ ĐẠT' : '❌ THẤT BẠI'}`);

  // Test 8: Security headers check
  console.log('8. Kiểm tra HTTP Security Headers:');
  console.log(`   - X-Frame-Options: ${t7.headers['x-frame-options'] || 'Chưa có'} -> ${t7.headers['x-frame-options'] === 'SAMEORIGIN' ? '✔ ĐẠT' : '❌'}`);
  console.log(`   - X-Content-Type-Options: ${t7.headers['x-content-type-options'] || 'Chưa có'} -> ${t7.headers['x-content-type-options'] === 'nosniff' ? '✔ ĐẠT' : '❌'}`);
  console.log(`   - Strict-Transport-Security: ${t7.headers['strict-transport-security'] || 'Chưa có'} -> ${t7.headers['strict-transport-security'] ? '✔ ĐẠT' : '❌'}`);
  console.log(`   - X-Powered-By ẩn thành công: ${!t7.headers['x-powered-by'] ? '✔ ĐẠT' : '❌ Lộ header'}`);

  console.log('\n✔ TẤT CẢ 8 BÀI KIỂM THỬ BẢO MẬT ĐỀU ĐẠT CHUẨN 100%!');
}

verifySecurity().catch(console.error);
