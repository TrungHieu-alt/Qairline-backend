/**
 * Middleware xử lý lỗi chung cho Express.
 * @param {Error} err - Đối tượng lỗi.
 * @param {Object} req - Đối tượng request của Express.
 * @param {Object} res - Đối tượng response của Express.
 * @param {Function} next - Hàm middleware tiếp theo.
 */
const errorHandler = (err, req, res, next) => {
  // Ghi log lỗi với thông tin bổ sung
  console.error(`❌ Lỗi tại ${req.method} ${req.url}:`, err);

  // Mã trạng thái và thông điệp lỗi
  const statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ';

  // Xử lý lỗi cơ sở dữ liệu PostgreSQL (ví dụ: trùng khóa duy nhất)
  if (err.code === '23505') { // Lỗi trùng khóa duy nhất trong PostgreSQL
    message = 'Dữ liệu đã tồn tại (ví dụ: email hoặc mã đã được sử dụng)';
  }

  // Trong môi trường phát triển, trả về stack trace để debug
  const isDevelopment = process.env.NODE_ENV === 'development';
  const response = {
    success: false,
    error: message,
  };

  if (isDevelopment) {
    response.stack = err.stack; // Thêm stack trace trong môi trường dev
  }

  // Gửi phản hồi JSON
  res.status(statusCode).json(response);
};

module.exports = errorHandler;