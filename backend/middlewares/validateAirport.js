const { body, param, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreateAirport = [
  body('name').notEmpty().withMessage('Tên sân bay là bắt buộc'),
  body('code')
    .notEmpty().withMessage('Mã sân bay là bắt buộc')
    .isLength({ max: 3 }).withMessage('Mã sân bay không được quá 3 ký tự')
    .toUpperCase()
    .withMessage('Mã sân bay phải viết hoa'),
  body('city_id').isUUID().withMessage('ID thành phố không hợp lệ')
];

exports.validateUpdateAirport = [
  param('id').isUUID().withMessage('ID sân bay không hợp lệ'),
  body('name').optional().notEmpty().withMessage('Tên sân bay không được rỗng nếu có'),
  body('code')
    .optional()
    .notEmpty().withMessage('Mã sân bay không được rỗng nếu có')
    .isLength({ max: 3 }).withMessage('Mã sân bay không được quá 3 ký tự')
    .toUpperCase()
    .withMessage('Mã sân bay phải viết hoa'),
  body('city_id').optional().isUUID().withMessage('ID thành phố không hợp lệ')
];

exports.validateGetAirportById = [
  param('id').isUUID().withMessage('ID sân bay không hợp lệ')
];

exports.validateDeleteAirport = [
  param('id').isUUID().withMessage('ID sân bay không hợp lệ')
];

exports.handleValidationErrors = handleValidationErrors;