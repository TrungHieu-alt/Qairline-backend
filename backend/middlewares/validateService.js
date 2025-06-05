const { body, param } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  notEmpty: (field) => `${field} không được để trống nếu có`,
  invalidUUID: (field) => `${field} không hợp lệ`,
  unique: (field) => `${field} đã tồn tại`,
  notFound: (field) => `${field} không tồn tại`,
  invalidPrice: 'Giá dịch vụ phải là số không âm với tối đa 2 chữ số thập phân',
};

// Validate tạo dịch vụ
exports.validateCreateService = [
  body('name')
    .notEmpty().withMessage(errorMessages.required('Tên dịch vụ'))
    .trim()
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT name FROM services WHERE name = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Tên dịch vụ'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra tên dịch vụ: ${err.message}`);
      }
      return true;
    }),
  body('description')
    .optional()
    .trim(),
  body('price')
    .notEmpty().withMessage(errorMessages.required('Giá dịch vụ'))
    .isFloat({ min: 0 }).withMessage(errorMessages.invalidPrice)
    .custom((value) => {
      if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        throw new Error(errorMessages.invalidPrice);
      }
      return true;
    }),
];

// Validate cập nhật dịch vụ
exports.validateUpdateService = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID dịch vụ'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM services WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Dịch vụ'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra dịch vụ: ${err.message}`);
      }
      return true;
    }),
  body('name')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Tên dịch vụ'))
    .trim()
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT name FROM services WHERE name = $1 AND id != $2', [value, req.params.id]);
          if (result.rows.length > 0) {
            throw new Error(errorMessages.unique('Tên dịch vụ'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra tên dịch vụ: ${err.message}`);
        }
      }
      return true;
    }),
  body('description')
    .optional()
    .trim(),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage(errorMessages.invalidPrice)
    .custom((value) => {
      if (value !== undefined && !/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        throw new Error(errorMessages.invalidPrice);
      }
      return true;
    }),
];

// Validate lấy dịch vụ theo ID
exports.validateGetServiceById = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID dịch vụ'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM services WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Dịch vụ'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra dịch vụ: ${err.message}`);
      }
      return true;
    }),
];

// Validate xóa dịch vụ
exports.validateDeleteService = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID dịch vụ'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM services WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Dịch vụ'));
        }
        // Kiểm tra xem dịch vụ có đang được sử dụng hay không (tùy nghiệp vụ)
        // Ví dụ: kiểm tra trong bảng reservation_services (nếu có)
        // const usageResult = await pool.query('SELECT id FROM reservation_services WHERE service_id = $1', [value]);
        // if (usageResult.rows.length > 0) {
        //   throw new Error('Dịch vụ đang được sử dụng và không thể xóa');
        // }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra dịch vụ: ${err.message}`);
      }
      return true;
    }),
];