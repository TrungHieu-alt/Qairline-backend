const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const router = require('./routes/routes');

const app = express();

// Middleware toàn cục
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(morgan('combined')); // Logging
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Giới hạn 100 request mỗi window
    message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' }
  })
);

// Routes
app.use('/api', router);

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
});

app.listen(3000, () => console.log('Server chạy trên cổng 3000'));