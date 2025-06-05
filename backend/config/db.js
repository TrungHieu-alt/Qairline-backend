const { Pool } = require('pg');
const prompt = require('prompt-sync')({ sigint: true });

// Kiểm tra môi trường phát triển
const isDevelopment = process.env.NODE_ENV === 'development';

// Hàm yêu cầu dev nhập thông tin
function getDatabaseConfig() {
  if (!isDevelopment) {
    throw new Error('❌ Chỉ được nhập thông tin cơ sở dữ liệu trong môi trường phát triển');
  }

  console.log('📋 Vui lòng nhập thông tin cơ sở dữ liệu:');
  const user = prompt('Username [postgres]: ') || 'postgres';
  const host = prompt('Server [localhost]: ') || 'localhost';
  const port = prompt('Port [5432]: ') || '5432';
  const database = prompt('Tên database (ví dụ: QAirline): ');
  const password = prompt('Mật khẩu database: ', { echo: '*' }); // Ẩn mật khẩu khi nhập

  if (!database || !password || !user || !host || !port) {
    throw new Error('❌ Các trường user, host, port, database, password không được để trống');
  }

  return {
    user,
    host,
    port: parseInt(port, 10),
    database,
    password,
  };
}

// Cấu hình Pool
let config;
try {
  config = {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
    max: 10, // Số kết nối tối đa
    idleTimeoutMillis: 30000, // Ngắt kết nối sau 30 giây không hoạt động
    connectionTimeoutMillis: 10000, // Timeout kết nối sau 10 giây
  };

  // Nếu là môi trường phát triển, yêu cầu nhập thông tin
  if (isDevelopment) {
    const { user, host, port, database, password } = getDatabaseConfig();
    config.user = user;
    config.host = host;
    config.port = port;
    config.database = database;
    config.password = password;
  } else {
    // Trong production, lấy từ biến môi trường
    config.database = process.env.PGDATABASE;
    config.password = process.env.PGPASSWORD;
    if (!config.database || !config.password) {
      throw new Error('❌ Thiếu biến môi trường PGDATABASE hoặc PGPASSWORD trong production');
    }
  }

  // Debug: In ra cấu hình để kiểm tra
  console.log('🔍 Cấu hình kết nối:', {
    user: config.user,
    host: config.host,
    port: config.port,
    database: config.database,
    password: isDevelopment ? config.password : '[ẩn]',
  });
} catch (error) {
  console.error('❌ Lỗi cấu hình:', error.message);
  process.exit(1); // Thoát ứng dụng nếu cấu hình lỗi
}

const pool = new Pool(config);

pool.on('connect', () => {
  console.log(
    `✅ Đã kết nối thành công với cơ sở dữ liệu PostgreSQL! ` +
    `Tên database: ${config.database}, ` +
    `Host: ${config.host}, ` +
    `Port: ${config.port}, ` +
    `User: ${config.user}`
  );
});

pool.on('error', (err) => {
  console.error(
    `❌ Lỗi kết nối cơ sở dữ liệu: ${err.message}. ` +
    `Tên database: ${config.database}, ` +
    `Host: ${config.host}, ` +
    `Port: ${config.port}, ` +
    `User: ${config.user}`,
    err.stack
  );
});

module.exports = pool;