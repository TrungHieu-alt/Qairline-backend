const { body, param, query } = require('express-validator');

exports.validateBookTicket = [
  body('flight_id').isUUID().withMessage('ID chuyến bay không hợp lệ'),
  body('customer_id').isUUID().withMessage('ID khách hàng không hợp lệ'),
  body('ticket_class_id').isUUID().withMessage('ID hạng vé không hợp lệ'),
  body('seat_number').optional().notEmpty().withMessage('Số ghế là bắt buộc nếu cung cấp'),
  body('cancellation_deadline')
    .isISO8601()
    .toDate()
    .withMessage('Hạn hủy không hợp lệ')
];

exports.validateBookMultipleTickets = [
  body('passengers')
    .isArray({ min: 1 })
    .withMessage('Danh sách hành khách phải là mảng không rỗng'),
  body('passengers.*.email')
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('passengers.*.first_name')
    .notEmpty()
    .withMessage('Tên là bắt buộc'),
  body('passengers.*.last_name')
    .notEmpty()
    .withMessage('Họ là bắt buộc'),
  body('passengers.*.phone_number')
    .notEmpty()
    .withMessage('Số điện thoại là bắt buộc')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Số điện thoại không đúng định dạng'),
  body('passengers.*.identity_number')
    .notEmpty()
    .withMessage('Số định danh là bắt buộc')
    .matches(/^\d{9,12}$/)
    .withMessage('Số định danh không đúng định dạng'),
  body('passengers.*.seat_number')
    .optional()
    .notEmpty()
    .withMessage('Số ghế là bắt buộc nếu cung cấp'),
  body('flight_id').isUUID().withMessage('ID chuyến bay không hợp lệ'),
  body('ticket_class_id').isUUID().withMessage('ID hạng vé không hợp lệ'),
  body('cancellation_deadline')
    .isISO8601()
    .toDate()
    .withMessage('Hạn hủy không hợp lệ')
];

exports.validateTicketParams = [
  param('id').isUUID().withMessage('ID vé không hợp lệ')
];

exports.validateTicketCode = [
  param('code').isUUID().withMessage('Mã vé không hợp lệ')
];

exports.validateGetTicketsByEmail = [
  param('email').isEmail().withMessage('Email không hợp lệ')
];

exports.validateTicketStats = [
  query('flight_id')
    .optional()
    .isUUID()
    .withMessage('ID chuyến bay không hợp lệ'),
  query('start_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  query('end_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Ngày kết thúc không hợp lệ')
    .custom((value, { req }) => {
      if (req.query.start_date && new Date(value) < new Date(req.query.start_date)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }
      return true;
    }),
  query('ticket_status')
    .optional()
    .isIn(['Confirmed', 'Cancelled', 'PendingPayment'])
    .withMessage('Trạng thái vé không hợp lệ')
];