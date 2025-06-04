const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Middleware xử lý lỗi validation (có thể được chuyển ra file riêng sau)
exports.validateCreateReservation = [
  body('passenger_id')
    .isUUID().withMessage('Passenger ID không hợp lệ')
    .notEmpty().withMessage('Passenger ID là bắt buộc'),
  body('seat_id')
    .isUUID().withMessage('Seat ID không hợp lệ')
    .notEmpty().withMessage('Seat ID là bắt buộc'),

  // Optional payment validation
  body('payment').optional().isObject().withMessage('Thông tin thanh toán không hợp lệ'),
  body('payment.amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Số tiền thanh toán không hợp lệ (phải là số không âm)'),
  body('payment.due_date')
    .optional()
    .isISO8601().toDate().withMessage('Ngày hết hạn thanh toán không hợp lệ'),
  body('payment.status')
    .optional()
    .isIn(['N', 'P', 'C']).withMessage('Trạng thái thanh toán không hợp lệ. Chỉ chấp nhận N, P, C.'), // N: New, P: Paid, C: Cancelled - Adjust as per your actual statuses
];

exports.validateGetReservationById = [
  param('id')
    .isUUID().withMessage('ID đặt chỗ không hợp lệ')
    .notEmpty().withMessage('ID đặt chỗ là bắt buộc'),
];

exports.validateGetReservationsByPassengerId = [
  param('passengerId').isUUID().withMessage('ID hành khách không hợp lệ')
];

exports.validateCancelReservation = [
  param('id')
    .isUUID().withMessage('ID đặt chỗ không hợp lệ')
    .notEmpty().withMessage('ID đặt chỗ là bắt buộc'),
];