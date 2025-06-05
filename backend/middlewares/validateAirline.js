const { body, param, validationResult } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  invalidUUID: (field) => `${field} không hợp lệ`,
  notEmpty: (field) => `${field} không được rỗng nếu có`,
  maxLength: (field, max) => `${field} tối đa ${max} ký tự`,
  minLength: (field, min) => `${field} phải có ít nhất ${min} ký tự`,
  notFound: (field) => `${field} không tồn tại`,
  unique: (field) => `${field} đã tồn tại`,
};

// Validate tạo hãng hàng không
exports.validateCreateAirline = [
  body('name')
    .notEmpty().withMessage(errorMessages.required('Tên hãng hàng không'))
    .trim()
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT name FROM airlines WHERE name = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Tên hãng hàng không'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra tên hãng hàng không: ${err.message}`);
      }
      return true;
    }),
  body('code')
    .notEmpty().withMessage(errorMessages.required('Mã hãng hàng không'))
    .trim()
    .isLength({ min: 2, max: 3 }).withMessage('Mã hãng hàng không phải từ 2 đến 3 ký tự')
    .toUpperCase()
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT code FROM airlines WHERE code = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Mã hãng hàng không'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra mã hãng hàng không: ${err.message}`);
      }
      return true;
    }),
];

// Validate cập nhật hãng hàng không
exports.validateUpdateAirline = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID hãng hàng không'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM airlines WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hãng hàng không'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hãng hàng không: ${err.message}`);
      }
      return true;
    }),
  body('name')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Tên hãng hàng không'))
    .trim()
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT name FROM airlines WHERE name = $1 AND id != $2', [value, req.params.id]);
          if (result.rows.length > 0) {
            throw new Error(errorMessages.unique('Tên hãng hàng không'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra tên hãng hàng không: ${err.message}`);
        }
      }
      return true;
    }),
  body('code')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Mã hãng hàng không'))
    .trim()
    .isLength({ min: 2, max: 3 }).withMessage('Mã hãng hàng không phải từ 2 đến 3 ký tự')
    .toUpperCase()
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT code FROM airlines WHERE code = $1 AND id != $2', [value, req.params.id]);
          if (result.rows.length > 0) {
            throw new Error(errorMessages.unique('Mã hãng hàng không'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra mã hãng hàng không: ${err.message}`);
        }
      }
      return true;
    }),
];

// Validate lấy hãng hàng không theo ID
exports.validateGetAirlineById = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID hãng hàng không'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM airlines WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hãng hàng không'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hãng hàng không: ${err.message}`);
      }
      return true;
    }),
];

// Validate xóa hãng hàng không
exports.validateDeleteAirline = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID hãng hàng không'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM airlines WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hãng hàng không'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hãng hàng không: ${err.message}`);
      }
      return true;
    }),
];

// Middleware xử lý lỗi validation
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(`❌ Lỗi validate tại ${req.method} ${req.url}:`, errors.array());
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
};