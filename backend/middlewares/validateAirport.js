const { body, param } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  notEmpty: (field) => `${field} không được rỗng nếu có`,
  invalidUUID: (field) => `${field} không hợp lệ`,
  exactLength: (field, len) => `${field} phải đúng ${len} ký tự`,
  notFound: (field) => `${field} không tồn tại`,
  unique: (field) => `${field} đã tồn tại`,
};

// Validate tạo sân bay
exports.validateCreateAirport = [
  body('name')
    .notEmpty().withMessage(errorMessages.required('Tên sân bay'))
    .trim()
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT name FROM airports WHERE name = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Tên sân bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra tên sân bay: ${err.message}`);
      }
      return true;
    }),
  body('code')
    .notEmpty().withMessage(errorMessages.required('Mã sân bay'))
    .trim()
    .isLength({ min: 3, max: 3 }).withMessage(errorMessages.exactLength('Mã sân bay', 3))
    .matches(/^[A-Z0-9]+$/).withMessage('Mã sân bay chỉ chứa chữ hoa và số')
    .toUpperCase()
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT code FROM airports WHERE code = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Mã sân bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra mã sân bay: ${err.message}`);
      }
      return true;
    }),
  body('city_id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID thành phố'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM cities WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Thành phố'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra thành phố: ${err.message}`);
      }
      return true;
    }),
];

// Validate cập nhật sân bay
exports.validateUpdateAirport = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID sân bay'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM airports WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Sân bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra sân bay: ${err.message}`);
      }
      return true;
    }),
  body('name')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Tên sân bay'))
    .trim()
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT name FROM airports WHERE name = $1 AND id != $2', [value, req.params.id]);
          if (result.rows.length > 0) {
            throw new Error(errorMessages.unique('Tên sân bay'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra tên sân bay: ${err.message}`);
        }
      }
      return true;
    }),
  body('code')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Mã sân bay'))
    .trim()
    .isLength({ min: 3, max: 3 }).withMessage(errorMessages.exactLength('Mã sân bay', 3))
    .matches(/^[A-Z0-9]+$/).withMessage('Mã sân bay chỉ chứa chữ hoa và số')
    .toUpperCase()
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT code FROM airports WHERE code = $1 AND id != $2', [value, req.params.id]);
          if (result.rows.length > 0) {
            throw new Error(errorMessages.unique('Mã sân bay'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra mã sân bay: ${err.message}`);
        }
      }
      return true;
    }),
  body('city_id')
    .optional()
    .isUUID().withMessage(errorMessages.invalidUUID('ID thành phố'))
    .custom(async (value) => {
      if (value) {
        try {
          const result = await pool.query('SELECT id FROM cities WHERE id = $1', [value]);
          if (result.rows.length === 0) {
            throw new Error(errorMessages.notFound('Thành phố'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra thành phố: ${err.message}`);
        }
      }
      return true;
    }),
];

// Validate lấy sân bay theo ID
exports.validateGetAirportById = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID sân bay'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM airports WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Sân bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra sân bay: ${err.message}`);
      }
      return true;
    }),
];

// Validate xóa sân bay
exports.validateDeleteAirport = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID sân bay'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM airports WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Sân bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra sân bay: ${err.message}`);
      }
      return true;
    }),
];