const { body, param } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  invalidUUID: (field) => `${field} không hợp lệ`,
  invalidDate: (field) => `${field} không hợp lệ`,
  notFound: (field) => `${field} không tồn tại`,
  unique: (field) => `${field} đã được sử dụng`,
  invalidFloat: (field) => `${field} phải là số không âm`,
  invalidStatus: (field) => `${field} không hợp lệ. Chỉ chấp nhận NEW, PAID, CANCELLED`,
  pastDate: (field) => `${field} không được nằm trong quá khứ`,
  invalidReservation: 'Đặt chỗ không thể hủy do trạng thái hiện tại',
};

// Validate tạo đặt chỗ
exports.validateCreateReservation = [
  body('passenger_id')
    .notEmpty().withMessage(errorMessages.required('ID hành khách'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID hành khách'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM passengers WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hành khách'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hành khách: ${err.message}`);
      }
      return true;
    }),
  body('seat_id')
    .notEmpty().withMessage(errorMessages.required('ID ghế'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID ghế'))
    .custom(async (value) => {
      try {
        // Kiểm tra ghế tồn tại
        const seatResult = await pool.query('SELECT id, flight_id FROM seat_details WHERE id = $1', [value]);
        if (seatResult.rows.length === 0) {
          throw new Error(errorMessages.notFound('Ghế'));
        }
        // Kiểm tra ghế chưa được đặt
        const reservationResult = await pool.query('SELECT id FROM reservations WHERE seat_id = $1', [value]);
        if (reservationResult.rows.length > 0) {
          throw new Error(errorMessages.unique('Ghế'));
        }
        // Kiểm tra chuyến bay hợp lệ
        const flightId = seatResult.rows[0].flight_id;
        const flightResult = await pool.query('SELECT id, status FROM flights WHERE id = $1', [flightId]);
        if (flightResult.rows.length === 0 || ['CANCELLED', 'COMPLETED'].includes(flightResult.rows[0].status)) {
          throw new Error('Chuyến bay không hợp lệ hoặc đã kết thúc');
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra ghế: ${err.message}`);
      }
      return true;
    }),
  body('payment')
    .optional()
    .isObject().withMessage('Thông tin thanh toán không hợp lệ'),
  body('payment.amount')
    .optional()
    .isFloat({ min: 0 }).withMessage(errorMessages.invalidFloat('Số tiền thanh toán')),
  body('payment.due_date')
    .optional()
    .isISO8601().withMessage(errorMessages.invalidDate('Ngày hết hạn thanh toán'))
    .toDate()
    .custom((value) => {
      if (value) {
        const now = new Date();
        if (new Date(value) <= now) {
          throw new Error(errorMessages.pastDate('Ngày hết hạn thanh toán'));
        }
      }
      return true;
    }),
  body('payment.status')
    .optional()
    .isIn(['NEW', 'PAID', 'CANCELLED']).withMessage(errorMessages.invalidStatus('Trạng thái thanh toán'))
    .trim(),
];

// Validate lấy đặt chỗ theo ID
exports.validateGetReservationById = [
  param('id')
    .notEmpty().withMessage(errorMessages.required('ID đặt chỗ'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID đặt chỗ'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM reservations WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Đặt chỗ'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra đặt chỗ: ${err.message}`);
      }
      return true;
    }),
];

// Validate lấy các đặt chỗ theo ID hành khách
exports.validateGetReservationsByPassengerId = [
  param('passengerId')
    .isUUID().withMessage(errorMessages.invalidUUID('ID hành khách'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM passengers WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hành khách'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hành khách: ${err.message}`);
      }
      return true;
    }),
];

// Validate hủy đặt chỗ
exports.validateCancelReservation = [
  param('id')
    .notEmpty().withMessage(errorMessages.required('ID đặt chỗ'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID đặt chỗ'))
    .custom(async (id) => {
      try {
        const reservation = await pool.query('SELECT id FROM reservations WHERE id = $1', [id]);
        if (reservation.rows.length === 0) {
          throw new Error(errorMessages.notFound('Đặt chỗ'));
        }
        const paymentResult = await pool.query('SELECT status FROM payment_statuses WHERE reservation_id = $1', [id]);
        if (paymentResult.rows.length > 0 && paymentResult.rows[0].status === 'Y') {
          throw new Error(errorMessages.invalidReservation);
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra đặt chỗ: ${err.message}`);
      }
      return true;
    }),
];