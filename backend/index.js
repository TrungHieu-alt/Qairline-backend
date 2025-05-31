// backend/index.js
require('dotenv').config();          //Load .env trước mọi thứ

const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet    = require('helmet');
const router    = require('./routes/routes');

const app = express();

/* ----------  Middleware toàn cục ---------- */
app.use(helmet());                   // Thêm bảo mật HTTP header
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' }
}));

/* ----------  Router ---------- */
app.use('/api', router);

/* ----------  404 Not Found ---------- */
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' });
});

/* ----------  Error Handler ---------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ'
  });
});

/* ----------  Khởi động server ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));
