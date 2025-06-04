const { body, param, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreateAirline = [
  body('name').notEmpty().withMessage('Tên hãng hàng không là bắt buộc'),
  body('code')
    .notEmpty().withMessage('Mã hãng hàng không là bắt buộc')
    .isLength({ max: 3 }).withMessage('Mã hãng hàng không tối đa 3 ký tự')
    .toUpperCase(), // Store as uppercase
  body('logo_url').optional().isURL().withMessage('URL logo không hợp lệ')
];

exports.validateUpdateAirline = [
  param('id').isUUID().withMessage('ID hãng hàng không không hợp lệ'),
  body('name').optional().notEmpty().withMessage('Tên hãng hàng không không được rỗng nếu có'),
  body('code')
    .optional()
    .notEmpty().withMessage('Mã hãng hàng không không được rỗng nếu có')
    .isLength({ max: 3 }).withMessage('Mã hãng hàng không tối đa 3 ký tự')
    .toUpperCase(), // Store as uppercase
  body('logo_url').optional().isURL().withMessage('URL logo không hợp lệ nếu có')
];

exports.validateGetAirlineById = [
  param('id').isUUID().withMessage('ID hãng hàng không không hợp lệ')
];

exports.validateDeleteAirline = [
  param('id').isUUID().withMessage('ID hãng hàng không không hợp lệ')
];

// Middleware xử lý lỗi validation
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('❌ Validation Errors:', errors.array()); // Sử dụng console.error cho lỗi
    // Chỉ trả về thông báo lỗi đầu tiên để đơn giản
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
};