require('dotenv').config(); // Load .env trước mọi thứ
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const router = require('./routes/routes');
const pool = require('./config/db'); // Import Pool từ db.js

const app = express();

/* ---------- Middleware toàn cục ---------- */
app.use(helmet()); // Thêm bảo mật HTTP header

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' }
}));

/* ---------- Router ---------- */
app.use('/api', router);

/* ---------- 404 Not Found ---------- */
app.use((req, res, next) => 
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' }));


/* ---------- Error Handler ---------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ'
  });
});

/* ---------- Khởi động server ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));