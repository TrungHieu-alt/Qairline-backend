const { body, param, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreatePassenger = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('phone_number').notEmpty().withMessage('Phone number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('zipcode').notEmpty().withMessage('Zipcode is required'),
  body('country').notEmpty().withMessage('Country is required')
];

exports.validateRegister = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password')
    .notEmpty().withMessage('Password is required').bail() // Use bail to stop validation chain
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  // Removed validations for first_name, last_name, username as they are handled during passenger creation
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

exports.validateUpdatePassenger = [
  param('id').isUUID().withMessage('ID hành khách không hợp lệ'),
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty if provided'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty if provided'),
  body('email').optional().isEmail().withMessage('Invalid email format if provided'),
  body('phone_number').optional().notEmpty().withMessage('Phone number cannot be empty if provided'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty if provided'),
  body('city').optional().notEmpty().withMessage('City cannot be empty if provided'),
  body('state').optional().notEmpty().withMessage('State cannot be empty if provided'),
  body('zipcode').optional().notEmpty().withMessage('Zipcode cannot be empty if provided'),
  body('country').optional().notEmpty().withMessage('Country cannot be empty if provided')
];

exports.validateGetPassengerById = [
  param('id').isUUID().withMessage('ID hành khách không hợp lệ')
];

exports.validateDeletePassenger = [
  param('id').isUUID().withMessage('ID hành khách không hợp lệ')
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