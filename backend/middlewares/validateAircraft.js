const { body, param } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  invalidUUID: (field) => `${field} không hợp lệ`,
  invalidString: (field) => `${field} phải là chuỗi`,
  notFound: (field) => `${field} không tồn tại`,
  unique: (field) => `${field} đã tồn tại`,
};

// Validate tạo máy bay
exports.validateCreateAircraft = [
  body('airline_id')
    .notEmpty().withMessage(errorMessages.required('ID hãng hàng không'))
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
  body('aircraft_type_id')
    .notEmpty().withMessage(errorMessages.required('ID loại máy bay'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID loại máy bay'))
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
  body('registration_number')
    .notEmpty().withMessage(errorMessages.required('Số đăng ký'))
    .isString().withMessage(errorMessages.invalidString('Số đăng ký'))
    .trim()
    .isLength({ min: 5, max: 10 }).withMessage('Số đăng ký phải từ 5 đến 10 ký tự')
    .matches(/^[A-Z0-9-]+$/).withMessage('Số đăng ký chỉ chứa chữ hoa, số và dấu gạch ngang')
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT registration_number FROM aircrafts WHERE registration_number = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error(errorMessages.unique('Số đăng ký'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra số đăng ký: ${err.message}`);
      }
      return true;
    }),
];

// Validate cập nhật máy bay
exports.validateUpdateAircraft = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID máy bay'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM aircrafts WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Máy bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra máy bay: ${err.message}`);
      }
      return true;
    }),
  body('airline_id')
    .optional()
    .isUUID().withMessage(errorMessages.invalidUUID('ID hãng hàng không'))
    .custom(async (value) => {
      if (value) {
        try {
          const result = await pool.query('SELECT id FROM airlines WHERE id = $1', [value]);
          if (result.rows.length === 0) {
            throw new Error(errorMessages.notFound('Hãng hàng không'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra hãng hàng không: ${err.message}`);
        }
      }
      return true;
    }),
  body('aircraft_type_id')
    .optional()
    .isUUID().withMessage(errorMessages.invalidUUID('ID loại máy bay'))
    .custom(async (value) => {
      if (value) {
        try {
          const result = await pool.query('SELECT id FROM aircraft_types WHERE id = $1', [value]);
          if (result.rows.length === 0) {
            throw new Error(errorMessages.notFound('Loại máy bay'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra loại máy bay: ${err.message}`);
        }
      }
      return true;
    }),
  body('registration_number')
    .optional()
    .isString().withMessage(errorMessages.invalidString('Số đăng ký'))
    .trim()
    .isLength({ min: 5, max: 10 }).withMessage('Số đăng ký phải từ 5 đến 10 ký tự')
    .matches(/^[A-Z0-9-]+$/).withMessage('Số đăng ký chỉ chứa chữ hoa, số và dấu gạch ngang')
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query(
            'SELECT registration_number FROM aircrafts WHERE registration_number = $1 AND id != $2',
            [value, req.params.id]
          );
          if (result.rows.length > 0) {
            throw new Error(errorMessages.unique('Số đăng ký'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra số đăng ký: ${err.message}`);
        }
      }
      return true;
    }),
];

// Validate lấy máy bay theo ID
exports.validateGetAircraftById = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID máy bay'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM aircrafts WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Máy bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra máy bay: ${err.message}`);
      }
      return true;
    }),
];

// Validate xóa máy bay
exports.validateDeleteAircraft = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID máy bay'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM aircrafts WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Máy bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra máy bay: ${err.message}`);
      }
      return true;
    }),
];