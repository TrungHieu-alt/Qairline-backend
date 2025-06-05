require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const router = require('./routes/routes');
const pool = require('./config/db'); // Nhập Pool từ db.js

const app = express();

// Kiểm tra kết nối database
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Lỗi kết nối PostgreSQL:', err.stack);
    process.exit(1);
  }
  console.log('✅ Đã kết nối thành công với cơ sở dữ liệu PostgreSQL!');
  release();
});

/* ---------- Middleware toàn cục ---------- */
app.use(helmet());
const corsOptions = {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
}));

/* ---------- Router ---------- */
app.use('/api', router);

/* ---------- 404 Not Found ---------- */
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' });
});

/* ---------- Error Handler ---------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
  });
});

/* ---------- Khởi động server ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));