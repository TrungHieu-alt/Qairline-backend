// config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'QAirline',
  password: process.env.PGPASSWORD || '',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
});

pool.on('connect', () => {
  console.log('✅ Đã kết nối thành công với cơ sở dữ liệu PostgreSQL!');
});

pool.on('error', (err) => {
  console.error('❌ Lỗi kết nối cơ sở dữ liệu:', err.stack);
});

module.exports = pool;