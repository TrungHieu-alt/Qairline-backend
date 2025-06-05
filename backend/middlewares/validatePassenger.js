const { body, param, query } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  notEmpty: (field) => `${field} không được rỗng nếu có`,
  invalidFormat: (field) => `${field} không hợp lệ`,
  notFound: (field) => `${field} không tồn tại`,
  unique: (field) => `${field} đã tồn tại`,
};

// Validate tạo hành khách
exports.validateCreatePassenger = [
  body('first_name')
    .notEmpty().withMessage(errorMessages.required('Tên'))
    .trim()
    .isString().withMessage(errorMessages.invalidFormat('Tên')),
  body('last_name')
    .notEmpty().withMessage(errorMessages.required('Họ'))
    .trim()
    .isString().withMessage(errorMessages.invalidFormat('Họ')),
  body('email')
    .notEmpty().withMessage(errorMessages.required('Email'))
    .isEmail().withMessage(errorMessages.invalidFormat('Email'))
    .trim()
    .normalizeEmail()
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT email FROM passengers WHERE email = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Email'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra email: ${err.message}`);
      }
      return true;
    }),
  body('phone_number')
    .notEmpty().withMessage(errorMessages.required('Số điện thoại'))
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage(errorMessages.invalidFormat('Số điện thoại'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT phone_number FROM passengers WHERE phone_number = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Số điện thoại'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra số điện thoại: ${err.message}`);
      }
      return true;
    }),
];

// Validate cập nhật hành khách
exports.validateUpdatePassenger = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidFormat('ID hành khách'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM passengers WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hành khách'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hành khách: ${err.message}`);
      }
      return true;
    }),
  body('first_name')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Tên'))
    .trim()
    .isString().withMessage(errorMessages.invalidFormat('Tên')),
  body('last_name')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Họ'))
    .trim()
    .isString().withMessage(errorMessages.invalidFormat('Họ')),
  body('email')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Email'))
    .isEmail().withMessage(errorMessages.invalidFormat('Email'))
    .trim()
    .normalizeEmail()
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT email FROM passengers WHERE email = $1 AND id != $2', [value, req.params.id]);
          if (result.rows.length > 0) {
            throw new Error(errorMessages.unique('Email'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra email: ${err.message}`);
        }
      }
      return true;
    }),
  body('phone_number')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Số điện thoại'))
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage(errorMessages.invalidFormat('Số điện thoại'))
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT phone_number FROM passengers WHERE phone_number = $1 AND id != $2', [value, req.params.id]);
          if (result.rows.length > 0) {
            throw new Error(errorMessages.unique('Số điện thoại'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra số điện thoại: ${err.message}`);
        }
      }
      return true;
    }),
];

// Validate lấy hành khách theo ID
exports.validateGetPassengerById = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidFormat('ID hành khách'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM passengers WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hành khách'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hành khách: ${err.message}`);
      }
      return true;
    }),
];

// Validate xóa hành khách
exports.validateDeletePassenger = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidFormat('ID hành khách'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM passengers WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hành khách'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hành khách: ${err.message}`);
      }
      return true;
    }),
];

// Validate liên kết hành khách với người dùng
exports.validateLinkPassengerToUser = [
  param('passengerId')
    .isUUID().withMessage(errorMessages.invalidFormat('ID hành khách'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM passengers WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hành khách'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hành khách: ${err.message}`);
      }
      return true;
    }),
  param('userId')
    .isUUID().withMessage(errorMessages.invalidFormat('ID người dùng'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM users WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Người dùng'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra người dùng: ${err.message}`);
      }
      return true;
    }),
];