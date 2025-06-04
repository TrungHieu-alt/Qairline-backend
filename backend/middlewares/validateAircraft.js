const { body, param } = require('express-validator');

exports.validateCreateAircraft = [
  body('airline_id')
    .isUUID().withMessage('ID hãng hàng không không hợp lệ')
    .notEmpty().withMessage('ID hãng hàng không là bắt buộc'),
  body('aircraft_type_id')
    .isUUID().withMessage('ID loại máy bay không hợp lệ')
    .notEmpty().withMessage('ID loại máy bay là bắt buộc'),
  body('registration_number')
    .notEmpty().withMessage('Số đăng ký là bắt buộc')
    .isString().withMessage('Số đăng ký phải là chuỗi'),
];

exports.validateUpdateAircraft = [
  param('id').isUUID().withMessage('ID máy bay không hợp lệ'),
  body('airline_id')
    .optional()
    .isUUID().withMessage('ID hãng hàng không không hợp lệ'),
  body('aircraft_type_id')
    .optional()
    .isUUID().withMessage('ID loại máy bay không hợp lệ'),
  body('registration_number')
    .optional()
    .isString().withMessage('Số đăng ký phải là chuỗi'),
];

exports.validateGetAircraftById = [
  param('id').isUUID().withMessage('ID máy bay không hợp lệ')
];

exports.validateDeleteAircraft = [
  param('id').isUUID().withMessage('ID máy bay không hợp lệ')
];