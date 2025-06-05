const { body, param } = require('express-validator');
const pool = require('../config/db'); // Import pool từ db.js
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Thông điệp lỗi chung
const errorMessages = {
  required: (field) => `${field} là bắt buộc`,
  invalidUUID: (field) => `${field} không hợp lệ`,
  invalidDate: (field) => `${field} không hợp lệ`,
  notFound: (field) => `${field} không tồn tại`,
  dateOrder: (field1, field2) => `${field1} phải sau ${field2}`,
  sameAirport: 'Sân bay đi và đến không được trùng nhau',
  invalidStatus: 'Chuyến bay không thể thay đổi trạng thái này',
  pastDate: (field) => `${field} không được nằm trong quá khứ`,
};

// Validate tìm kiếm chuyến bay
exports.validateSearchFlights = [
  body('from_airport_id')
    .notEmpty().withMessage(errorMessages.required('ID sân bay đi'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID sân bay đi'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM airports WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Sân bay đi'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra sân bay đi: ${err.message}`);
      }
      return true;
    }),
  body('to_airport_id')
    .notEmpty().withMessage(errorMessages.required('ID sân bay đến'))
    .isUUID().withMessage(errorMessages.invalidUUID('ID sân bay đến'))
    .custom(async (value, { req }) => {
      try {
        const result = await pool.query('SELECT id FROM airports WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Sân bay đến'));
        }
        if (value === req.body.from_airport_id) {
          throw new Error(errorMessages.sameAirport);
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra sân bay đến: ${err.message}`);
      }
      return true;
    }),
  body('date')
    .isISO8601().withMessage(errorMessages.invalidDate('Ngày'))
    .toDate()
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(value) < today) {
        throw new Error(errorMessages.pastDate('Ngày'));
      }
      return true;
    }),
];

// Validate trì hoãn chuyến bay
exports.validateDelayFlight = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID chuyến bay'))
    .custom(async (id) => {
      try {
        const result = await pool.query('SELECT id, status FROM flights WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Chuyến bay'));
        }
        if (['CANCELLED', 'COMPLETED'].includes(result.rows[0].status)) {
          throw new Error(errorMessages.invalidStatus);
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra chuyến bay: ${err.message}`);
      }
      return true;
    }),
  body('newDeparture')
    .isISO8601().withMessage(errorMessages.invalidDate('Thời gian khởi hành mới'))
    .toDate()
    .custom((value) => {
      const now = new Date();
      if (new Date(value) <= now) {
        throw new Error(errorMessages.pastDate('Thời gian khởi hành mới'));
      }
      return true;
    }),
  body('newArrival')
    .isISO8601().withMessage(errorMessages.invalidDate('Thời gian đến mới'))
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.newDeparture)) {
        throw new Error(errorMessages.dateOrder('Thời gian đến mới', 'thời gian khởi hành mới'));
      }
      return true;
    }),
];

// Validate tạo chuyến bay
exports.validateCreateFlight = [
  body('aircraft_id')
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
  body('source_airport_id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID sân bay đi'))
    .custom(async (value) => {
      try {
        const result = await pool.query('SELECT id FROM airports WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Sân bay đi'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra sân bay đi: ${err.message}`);
      }
      return true;
    }),
  body('destination_airport_id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID sân bay đến'))
    .custom(async (value, { req }) => {
      try {
        const result = await pool.query('SELECT id FROM airports WHERE id = $1', [value]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Sân bay đến'));
        }
        if (value === req.body.source_airport_id) {
          throw new Error(errorMessages.sameAirport);
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra sân bay đến: ${err.message}`);
      }
      return true;
    }),
  body('departure_time')
    .isISO8601().withMessage(errorMessages.invalidDate('Thời gian khởi hành'))
    .toDate()
    .custom((value) => {
      const now = new Date();
      if (new Date(value) <= now) {
        throw new Error(errorMessages.pastDate('Thời gian khởi hành'));
      }
      return true;
    }),
  body('arrival_time')
    .isISO8601().withMessage(errorMessages.invalidDate('Thời gian đến'))
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.departure_time)) {
        throw new Error(errorMessages.dateOrder('Thời gian đến', 'thời gian khởi hành'));
      }
      return true;
    }),
];

// Validate cập nhật chuyến bay
exports.validateUpdateFlight = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID chuyến bay'))
    .custom(async (id) => {
      try {
        const result = await pool.query('SELECT id, status FROM flights WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Chuyến bay'));
        }
        if (['CANCELLED', 'COMPLETED'].includes(result.rows[0].status)) {
          throw new Error(errorMessages.invalidStatus);
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra chuyến bay: ${err.message}`);
      }
      return true;
    }),
  body('aircraft_id')
    .optional()
    .isUUID().withMessage(errorMessages.invalidUUID('ID máy bay'))
    .custom(async (value) => {
      if (value) {
        try {
          const result = await pool.query('SELECT id FROM aircrafts WHERE id = $1', [value]);
          if (result.rows.length === 0) {
            throw new Error(errorMessages.notFound('Máy bay'));
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra máy bay: ${err.message}`);
        }
      }
      return true;
    }),
  body('source_airport_id')
    .optional()
    .isUUID().withMessage(errorMessages.invalidUUID('ID sân bay đi'))
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT id FROM airports WHERE id = $1', [value]);
          if (result.rows.length === 0) {
            throw new Error(errorMessages.notFound('Sân bay đi'));
          }
          if (value === req.body.destination_airport_id) {
            throw new Error(errorMessages.sameAirport);
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra sân bay đi: ${err.message}`);
        }
      }
      return true;
    }),
  body('destination_airport_id')
    .optional()
    .isUUID().withMessage(errorMessages.invalidUUID('ID sân bay đến'))
    .custom(async (value, { req }) => {
      if (value) {
        try {
          const result = await pool.query('SELECT id FROM airports WHERE id = $1', [value]);
          if (result.rows.length === 0) {
            throw new Error(errorMessages.notFound('Sân bay đến'));
          }
          if (value === req.body.source_airport_id) {
            throw new Error(errorMessages.sameAirport);
          }
        } catch (err) {
          throw new Error(`Lỗi kiểm tra sân bay đến: ${err.message}`);
        }
      }
      return true;
    }),
  body('departure_time')
    .optional()
    .isISO8601().withMessage(errorMessages.invalidDate('Thời gian khởi hành'))
    .toDate()
    .custom((value) => {
      if (value) {
        const now = new Date();
        if (new Date(value) <= now) {
          throw new Error(errorMessages.pastDate('Thời gian khởi hành'));
        }
      }
      return true;
    }),
  body('arrival_time')
    .optional()
    .isISO8601().withMessage(errorMessages.invalidDate('Thời gian đến'))
    .toDate()
    .custom((value, { req }) => {
      if (value && req.body.departure_time) {
        if (new Date(value) <= new Date(req.body.departure_time)) {
          throw new Error(errorMessages.dateOrder('Thời gian đến', 'thời gian khởi hành'));
        }
      }
      return true;
    }),
];

// Validate lấy chuyến bay theo ID
exports.validateGetFlightById = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID chuyến bay'))
    .custom(async (id) => {
      try {
        const result = await pool.query('SELECT id FROM flights WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Chuyến bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra chuyến bay: ${err.message}`);
      }
      return true;
    }),
];

// Validate xóa chuyến bay
exports.validateDeleteFlight = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID chuyến bay'))
    .custom(async (id) => {
      try {
        const result = await pool.query('SELECT id FROM flights WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Chuyến bay'));
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra chuyến bay: ${err.message}`);
      }
      return true;
    }),
];

// Validate hủy chuyến bay
exports.validateCancelFlight = [
  param('id')
    .isUUID().withMessage(errorMessages.invalidUUID('ID chuyến bay'))
    .custom(async (id) => {
      try {
        const result = await pool.query('SELECT id, status FROM flights WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          throw new Error(errorMessages.notFound('Chuyến bay'));
        }
        if (['CANCELLED', 'COMPLETED'].includes(result.rows[0].status)) {
          throw new Error(errorMessages.invalidStatus);
        }
      } catch (err) {
        throw new Error(`Lỗi kiểm tra chuyến bay: ${err.message}`);
      }
      return true;
    }),
];