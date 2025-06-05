const { body, param } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  notEmpty: (field) => `${field} không được để trống nếu có`,
  invalidUUID: (field) => `${field} không hợp lệ`,
  invalidString: (field) => `${field} phải là chuỗi`,
  unique: (field) => `${field} đã tồn tại`,
  notFound: (field) => `${field} không tồn tại`,
  inUse: 'Hạng ghế đang được sử dụng và không thể xóa',
};

// Validate tạo hạng ghế
exports.validateCreateTravelClass = [
  body('name')
    .notEmpty().withMessage(errorMessages.required('Tên hạng ghế'))
    .trim()
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT name FROM travel_classes WHERE name = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Tên hạng ghế'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra tên hạng ghế: ${err.message}`);
      }
      return true;
    }),
  body('description')
    .optional()
    .isString().withMessage(errorMessages.invalidString('Mô tả'))
    .trim(),
];

// Validate cập nhật hạng ghế
exports.validateUpdateTravelClass = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID hạng ghế'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM travel_classes WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hạng ghế'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hạng ghế: ${err.message}`);
      }
      return true;
    }),
  body('name')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Tên hạng ghế'))
    .trim()
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT name FROM travel_classes WHERE name = $1 AND id != $2', [value, req.params.id]);
          if (result.rows.length > 0) {
            throw new Error(errorMessages.unique('Tên hạng ghế'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra tên hạng ghế: ${err.message}`);
        }
      }
      return true;
    }),
  body('description')
    .optional()
    .isString().withMessage(errorMessages.invalidString('Mô tả'))
    .trim(),
];

// Validate lấy hạng ghế theo ID
exports.validateGetTravelClassById = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID hạng ghế'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM travel_classes WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hạng ghế'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hạng ghế: ${err.message}`);
      }
      return true;
    }),
];

// Validate xóa hạng ghế
exports.validateDeleteTravelClass = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID hạng ghế'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM travel_classes WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Hạng ghế'));
        }
        // Kiểm tra xem hạng ghế có đang được sử dụng hay không
        const usageResult = await pool.query('SELECT travel_class_id FROM service_offerings WHERE travel_class_id = $1', [value]);
        if (usageResult.rows.length > 0) {
          throw new Error(errorMessages.inUse);
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra hạng ghế: ${err.message}`);
      }
      return true;
    }),
];