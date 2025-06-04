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
