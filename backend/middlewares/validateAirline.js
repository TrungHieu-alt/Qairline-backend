const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreateAirline = [
  body('name').notEmpty().withMessage('Tên hãng hàng không là bắt buộc'),
  body('code')
    .notEmpty().withMessage('Mã hãng hàng không là bắt buộc')
    .isLength({ max: 3 }).withMessage('Mã hãng hàng không tối đa 3 ký tự')
    .toUpperCase(), // Store as uppercase
]; // Removed logo_url validation

exports.validateUpdateAirline = [
  param('id').isUUID().withMessage('ID hãng hàng không không hợp lệ'),
  body('name').optional().notEmpty().withMessage('Tên hãng hàng không không được rỗng nếu có'),
  body('code')
    .optional()
    .notEmpty().withMessage('Mã hãng hàng không không được rỗng nếu có')
    .isLength({ max: 3 }).withMessage('Mã hãng hàng không tối đa 3 ký tự')
    .toUpperCase(), // Store as uppercase
];

exports.validateGetAirlineById = [
  param('id').isUUID().withMessage('ID hãng hàng không không hợp lệ')
];

exports.validateDeleteAirline = [
  param('id').isUUID().withMessage('ID hãng hàng không không hợp lệ')
];
