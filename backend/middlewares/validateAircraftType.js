const { body, param } = require('express-validator');
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

// Validate tạo loại máy bay
exports.validateCreateAircraftType = [
  body('name')
    .notEmpty().withMessage(errorMessages.required('Tên loại máy bay'))
    .trim()
    .isString().withMessage(errorMessages.invalidFormat('Tên loại máy bay'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT name FROM aircraft_types WHERE name = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Tên loại máy bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra tên loại máy bay: ${err.message}`);
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
    .isString().withMessage(errorMessages.invalidFormat('Mô tả')),
];

// Validate cập nhật loại máy bay
exports.validateUpdateAircraftType = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidFormat('ID loại máy bay'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM aircraft_types WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Loại máy bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra loại máy bay: ${err.message}`);
      }
      return true;
    }),
  body('name')
    .optional()
    .notEmpty().withMessage(errorMessages.notEmpty('Tên loại máy bay'))
    .trim()
    .isString().withMessage(errorMessages.invalidFormat('Tên loại máy bay'))
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT name FROM aircraft_types WHERE name = $1 AND id != $2', [value, req.params.id]);
          if (result.rows.length > 0) {
            throw new Error(errorMessages.unique('Tên loại máy bay'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra tên loại máy bay: ${err.message}`);
        }
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
    .isString().withMessage(errorMessages.invalidFormat('Mô tả')),
];

// Validate lấy loại máy bay theo ID
exports.validateGetAircraftTypeById = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidFormat('ID loại máy bay'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM aircraft_types WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Loại máy bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra loại máy bay: ${err.message}`);
      }
      return true;
    }),
];

// Validate xóa loại máy bay
exports.validateDeleteAircraftType = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidFormat('ID loại máy bay'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM aircraft_types WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Loại máy bay'));
        }
        // Kiểm tra ràng buộc khóa ngoại
        const aircraftCheck = await pool.query('SELECT id FROM aircrafts WHERE aircraft_type_id = $1', [value]);
        if (aircraftCheck.rows.length > 0) {
          throw new Error('Không thể xóa loại máy bay vì có máy bay đang sử dụng');
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra loại máy bay: ${err.message}`);
      }
      return true;
    }),
];