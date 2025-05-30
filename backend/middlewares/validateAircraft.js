const { body, param } = require('express-validator');

exports.validateCreateAircraft = [
  body('airline_id').isUUID().withMessage('ID hãng hàng không không hợp lệ'),
  body('aircraft_type').notEmpty().withMessage('Loại máy bay là bắt buộc'),
  body('total_first_class_seats')
    .isInt({ min: 0 })
    .withMessage('Số ghế hạng nhất phải là số không âm'),
  body('total_business_class_seats')
    .isInt({ min: 0 })
    .withMessage('Số ghế hạng thương gia phải là số không âm'),
  body('total_economy_class_seats')
    .isInt({ min: 0 })
    .withMessage('Số ghế hạng phổ thông phải là số không âm'),
  body('status')
    .notEmpty()
    .withMessage('Trạng thái là bắt buộc'),
  body('aircraft_code')
    .notEmpty()
    .withMessage('Mã máy bay là bắt buộc'),
  body('manufacturer')
    .notEmpty()
    .withMessage('Hãng sản xuất là bắt buộc')
];

exports.validateUpdateAircraft = [
  param('id').isUUID().withMessage('ID máy bay không hợp lệ'),
  body('airline_id').isUUID().withMessage('ID hãng hàng không không hợp lệ'),
  body('aircraft_type').notEmpty().withMessage('Loại máy bay là bắt buộc'),
  body('total_first_class_seats')
    .isInt({ min: 0 })
    .withMessage('Số ghế hạng nhất phải là số không âm'),
  body('total_business_class_seats')
    .isInt({ min: 0 })
    .withMessage('Số ghế hạng thương gia phải là số không âm'),
  body('total_economy_class_seats')
    .isInt({ min: 0 })
    .withMessage('Số ghế hạng phổ thông phải là số không âm'),
  body('status')
    .notEmpty()
    .withMessage('Trạng thái là bắt buộc'),
  body('aircraft_code')
    .notEmpty()
    .withMessage('Mã máy bay là bắt buộc'),
  body('manufacturer')
    .notEmpty()
    .withMessage('Hãng sản xuất là bắt buộc')
];

exports.validateGetAircraftById = [
  param('id').isUUID().withMessage('ID máy bay không hợp lệ')
];