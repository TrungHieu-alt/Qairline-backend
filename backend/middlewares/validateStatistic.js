const { query } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  notEmpty: (field) => `${field} không được rỗng nếu có`,
  invalidFormat: (field) => `${field} không hợp lệ`,
  invalidRange: (field) => `${field} không nằm trong phạm vi hợp lệ`,
};

// Validate lấy thống kê tổng quan (/stats)
exports.validateGetStats = [
  // Không cần query params, để trống cho tương lai mở rộng
];

// Validate lấy đặt chỗ gần đây (/recent-bookings)
exports.validateGetRecentBookings = [
  query('limit')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Limit'))
    .isInt({ min: 1, max: 100 }).withMessage(errorMessages.invalidRange('Limit'))
    .toInt(),
];

// Validate lấy xu hướng đặt chỗ (/booking-trends)
exports.validateGetBookingTrends = [
  query('days')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Số ngày'))
    .isInt({ min: 1, max: 365 }).withMessage(errorMessages.invalidRange('Số ngày'))
    .toInt(),
];

// Validate lấy chuyến bay sắp khởi hành (/upcoming-flights)
exports.validateGetUpcomingFlights = [
  query('limit')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Limit'))
    .isInt({ min: 1, max: 100 }).withMessage(errorMessages.invalidRange('Limit'))
    .toInt(),
];

// Validate lấy doanh thu theo thời gian (/stats/revenue-by-time)
exports.validateGetRevenueByTime = [
  query('startDate')
    .notEmpty().withMessage(errorMessages.required('Ngày bắt đầu'))
    .isISO8601().withMessage(errorMessages.invalidFormat('Ngày bắt đầu'))
    .trim(),
  query('endDate')
    .notEmpty().withMessage(errorMessages.required('Ngày kết thúc'))
    .isISO8601().withMessage(errorMessages.invalidFormat('Ngày kết thúc'))
    .trim()
    .custom(async (endDate, { req }) => {
      try {
        if (new Date(endDate) < new Date(req.query.startDate)) {
          throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra ngày: ${err.message}`);
      }
      return true;
    }),
  query('interval')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Khoảng thời gian'))
    .isIn(['day', 'month', 'year']).withMessage(errorMessages.invalidFormat('Khoảng thời gian'))
    .trim(),
];

// Validate lấy doanh thu theo tuyến bay (/stats/revenue-by-route)
exports.validateGetRevenueByRoute = [
  query('startDate')
    .notEmpty().withMessage(errorMessages.required('Ngày bắt đầu'))
    .isISO8601().withMessage(errorMessages.invalidFormat('Ngày bắt đầu'))
    .trim(),
  query('endDate')
    .notEmpty().withMessage(errorMessages.required('Ngày kết thúc'))
    .isISO8601().withMessage(errorMessages.invalidFormat('Ngày kết thúc'))
    .trim()
    .custom(async (endDate, { req }) => {
      try {
        if (new Date(endDate) < new Date(req.query.startDate)) {
          throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra ngày: ${err.message}`);
      }
      return true;
    }),
];

// Validate lấy doanh thu theo hãng hàng không (/stats/revenue-by-airline)
exports.validateGetRevenueByAirline = exports.validateGetRevenueByRoute;

// Validate lấy doanh thu theo hạng ghế (/stats/revenue-by-travel-class)
exports.validateGetRevenueByTravelClass = exports.validateGetRevenueByRoute;