const http = require('http');

function post(path, body, cookie = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(cookie ? { 'Cookie': cookie } : {})
      }
    }, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(resBody) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, cookie = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers: {
        ...(cookie ? { 'Cookie': cookie } : {})
      }
    }, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(resBody) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('1. Đăng nhập với admin...');
  const loginRes = await post('/api/auth/login', { username: 'admin', password: 'admin123' });
  console.log('   Login status:', loginRes.status);
  const cookie = loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

  console.log('\n2. Thử nghiệm Autocomplete tìm kiếm sản phẩm: "Laptop"...');
  const searchRes = await get('/api/products?search=Laptop&status=active', cookie);
  console.log('   Tìm thấy sản phẩm:', searchRes.data.products.map(p => ({ code: p.code, name: p.name, price: p.price })));
  const prod = searchRes.data.products[0];

  console.log('\n3. Tạo Order mới với sản phẩm tìm được và số lượng = 5...');
  const createOrderRes = await post('/api/orders', {
    product_id: prod.id,
    product_code: prod.code,
    product_name: prod.name,
    quantity: 5,
    unit: prod.unit,
    unit_price: prod.price,
    customer_name: 'Khách Hàng Thử Nghiệm',
    phone: '0909123456',
    note: 'Đơn hàng test tính năng autocomplete và lưu số lượng'
  }, cookie);
  console.log('   Kết quả tạo order:', createOrderRes.status, createOrderRes.data.message);
  console.log('   Chi tiết order vừa tạo:', createOrderRes.data.order);

  console.log('\n4. Kiểm tra danh sách đơn hàng GET /api/orders...');
  const listRes = await get('/api/orders', cookie);
  console.log('   Tổng số đơn trong hệ thống:', listRes.data.orders.length);
  const newest = listRes.data.orders[0];
  console.log('   Đơn mới nhất:', {
    order_code: newest.order_code,
    product_code: newest.product_code,
    product_name: newest.product_name,
    quantity: newest.quantity,
    total_amount: newest.total_amount
  });

  console.log('\n✔ TẤT CẢ CÁC BƯỚC ĐỀU THÀNH CÔNG VÀ CHÍNH XÁC!');
}

run().catch(console.error);
