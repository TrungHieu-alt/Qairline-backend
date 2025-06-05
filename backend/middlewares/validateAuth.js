const { body } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  invalidEmail: 'Email không hợp lệ',
  unique: (field) => `${field} đã tồn tại`,
  minLength: (field, min) => `${field} phải có ít nhất ${min} ký tự`,
  invalidPassword: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt',
};

// Validate đăng nhập
exports.validateLogin = [
  body('email')
    .isEmail().withMessage(errorMessages.invalidEmail)
    .trim()
    .normalizeEmail()
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT email FROM users WHERE email = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error('Email không tồn tại');
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra email: ${err.message}`);
      }
      return true;
    }),
  body('password')
    .notEmpty().withMessage(errorMessages.required('Mật khẩu')),
];

// Validate đăng ký
exports.validateRegister = [
  body('email')
    .isEmail().withMessage(errorMessages.invalidEmail)
    .trim()
    .normalizeEmail()
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT email FROM users WHERE email = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Email'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra email: ${err.message}`);
      }
      return true;
    }),
  body('password')
    .notEmpty().withMessage(errorMessages.required('Mật khẩu'))
    .isLength({ min: 8 }).withMessage(errorMessages.minLength('Mật khẩu', 8))
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage(errorMessages.invalidPassword),
];