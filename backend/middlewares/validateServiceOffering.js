const { body, param } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  invalidUUID: (field) => `${field} không hợp lệ`,
  invalidBoolean: (field) => `${field} phải là giá trị boolean`,
  invalidMonth: (field) => `${field} phải có định dạng YYYY-MM (ví dụ: 2025-06)`,
  notFound: (field) => `${field} không tồn tại`,
  monthOrder: 'Tháng kết thúc phải lớn hơn hoặc bằng tháng bắt đầu',
  inUse: 'Dịch vụ cung cấp đang được sử dụng và không thể xóa',
};

// Validate tạo dịch vụ cung cấp
exports.validateCreateServiceOffering = [
  body('travel_class_id')
    .notEmpty().withMessage(errorMessages.required('ID hạng ghế'))
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
  body('service_id')
    .notEmpty().withMessage(errorMessages.required('ID dịch vụ'))
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
  body('is_offered')
    .notEmpty().withMessage(errorMessages.required('Trạng thái cung cấp'))
    .isBoolean().withMessage(errorMessages.invalidBoolean('Trạng thái cung cấp')),
  body('from_month')
    .notEmpty().withMessage(errorMessages.required('Tháng bắt đầu'))
    .trim()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage(errorMessages.invalidMonth('Tháng bắt đầu')),
  body('to_month')
    .notEmpty().withMessage(errorMessages.required('Tháng kết thúc'))
    .trim()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage(errorMessages.invalidMonth('Tháng kết thúc'))
    .custom((value, { req }) => {
      const fromMonth = req.body.from_month;
      if (fromMonth && value < fromMonth) {
        throw new Error(errorMessages.monthOrder);
      }
      return true;
    }),
];

// Validate cập nhật dịch vụ cung cấp
exports.validateUpdateServiceOffering = [
  param('travelClassId')
    .notEmpty().withMessage(errorMessages.required('ID hạng ghế'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID hạng ghế'))
    .custom(async (value, { req }) => {
      try {
        const result = await pool.query(
          'SELECT travel_class_id FROM service_offerings WHERE travel_class_id = $1 AND service_id = $2',
          [value, req.params.serviceId]
        );
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Dịch vụ cung cấp'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra dịch vụ cung cấp: ${err.message}`);
      }
      return true;
    }),
  param('serviceId')
    .notEmpty().withMessage(errorMessages.required('ID dịch vụ'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID dịch vụ')),
  body('is_offered')
    .optional()
    .isBoolean().withMessage(errorMessages.invalidBoolean('Trạng thái cung cấp')),
  body('from_month')
    .optional()
    .trim()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage(errorMessages.invalidMonth('Tháng bắt đầu')),
  body('to_month')
    .optional()
    .trim()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage(errorMessages.invalidMonth('Tháng kết thúc'))
    .custom((value, { req }) => {
      const fromMonth = req.body.from_month !== undefined ? req.body.from_month : null;
      if (fromMonth && value && value < fromMonth) {
        throw new Error(errorMessages.monthOrder);
      }
      return true;
    }),
];

// Validate lấy dịch vụ cung cấp theo ID
exports.validateGetServiceOfferingById = [
  param('travelClassId')
    .notEmpty().withMessage(errorMessages.required('ID hạng ghế'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID hạng ghế'))
    .custom(async (value, { req }) => {
      try {
        const result = await pool.query(
          'SELECT travel_class_id FROM service_offerings WHERE travel_class_id = $1 AND service_id = $2',
          [value, req.params.serviceId]
        );
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Dịch vụ cung cấp'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra dịch vụ cung cấp: ${err.message}`);
      }
      return true;
    }),
  param('serviceId')
    .notEmpty().withMessage(errorMessages.required('ID dịch vụ'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID dịch vụ')),
];

// Validate xóa dịch vụ cung cấp
exports.validateDeleteServiceOffering = [
  param('travelClassId')
    .notEmpty().withMessage(errorMessages.required('ID hạng ghế'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID hạng ghế'))
    .custom(async (value, { req }) => {
      try {
        const result = await pool.query(
          'SELECT travel_class_id FROM service_offerings WHERE travel_class_id = $1 AND service_id = $2',
          [value, req.params.serviceId]
        );
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Dịch vụ cung cấp'));
        }
        // Kiểm tra xem dịch vụ cung cấp có đang được sử dụng hay không (tùy nghiệp vụ)
        // Ví dụ: kiểm tra trong bảng reservation_services (nếu có)
        // const usageResult = await pool.query(
        //   'SELECT id FROM reservation_services WHERE travel_class_id = $1 AND service_id = $2',
        //   [value, req.params.serviceId]
        // );
        // if (usageResult.rows.length > 0) {
        //   throw new Error(errorMessages.inUse);
        // }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra dịch vụ cung cấp: ${err.message}`);
      }
      return true;
    }),
  param('serviceId')
    .notEmpty().withMessage(errorMessages.required('ID dịch vụ'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID dịch vụ')),
];