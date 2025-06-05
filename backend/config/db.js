const { Pool } = require('pg');

const isDevelopment = process.env.NODE_ENV === 'development';

let config;
try {
  config = {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
    database: process.env.PGDATABASE || 'qairline',
    password: process.env.PGPASSWORD || '1',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  console.log('🔍 Cấu hình kết nối:', {
    user: config.user,
    host: config.host,
    port: config.port,
    database: config.database,
    password: isDevelopment ? config.password : '[ẩn]',
  });
} catch (error) {
  console.error('❌ Lỗi cấu hình:', error.message);
  process.exit(1);
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