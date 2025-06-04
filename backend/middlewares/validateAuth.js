const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils'); // Import handleValidationErrors

exports.validateLogin = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.validateRegister = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// Middleware xử lý lỗi validation
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation Errors:', errors.array()); // Thêm log
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
};