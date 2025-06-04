const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateSearchFlights = [
  body('from_airport_id')
    .notEmpty()
    .withMessage('ID sân bay đi là bắt buộc')
    .isUUID()
    .withMessage('ID sân bay đi không hợp lệ'),
  body('to_airport_id')
    .notEmpty()
    .withMessage('ID sân bay đến là bắt buộc')
    .isUUID()
    .withMessage('ID sân bay đến không hợp lệ'),
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Ngày không hợp lệ')
];

exports.validateDelayFlight = [
  param('id')
    .isUUID()
    .withMessage('ID chuyến bay không hợp lệ'),
  body('newDeparture')
    .isISO8601()
    .toDate()
    .withMessage('Thời gian khởi hành mới không hợp lệ'),
  body('newArrival')
    .isISO8601()
    .toDate()
    .withMessage('Thời gian đến mới không hợp lệ')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.newDeparture)) {
        throw new Error('Thời gian đến mới phải sau thời gian khởi hành mới');
      }
      return true;
    })
];

// Validate hiện có cho createFlight giữ nguyên
exports.validateCreateFlight = [
  body('airline_id').isUUID().withMessage('ID hãng hàng không không hợp lệ'),
  body('aircraft_id').isUUID().withMessage('ID máy bay không hợp lệ'),
  body('flight_number')
    .notEmpty()
    .withMessage('Số hiệu chuyến bay là bắt buộc')
    .isLength({ max: 10 })
    .withMessage('Số hiệu chuyến bay quá dài'),
  body('departure_time')
    .isISO8601()
    .toDate()
    .withMessage('Thời gian khởi hành không hợp lệ'),
  body('arrival_time')
    .isISO8601()
    .toDate()
    .withMessage('Thời gian đến không hợp lệ')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.departure_time)) {
        throw new Error('Thời gian đến phải sau thời gian khởi hành');
      }
      return true;
    }),
];

exports.validateUpdateFlight = [
  param('id').isUUID().withMessage('ID chuyến bay không hợp lệ'),
  body('aircraft_id')
    .optional()
    .isUUID()
    .withMessage('ID máy bay không hợp lệ'),
  body('source_airport_id')
    .optional()
    .isUUID()
    .withMessage('ID sân bay đi không hợp lệ'),
  body('destination_airport_id')
    .optional()
    .isUUID()
    .withMessage('ID sân bay đến không hợp lệ'),
  body('departure_time')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Thời gian khởi hành không hợp lệ'),
  body('arrival_time').optional().isISO8601().toDate().withMessage('Thời gian đến không hợp lệ'),
];

exports.validateGetFlightById = [
  param('id').isUUID().withMessage('ID chuyến bay không hợp lệ')
];

exports.validateDeleteFlight = [
  param('id').isUUID().withMessage('ID chuyến bay không hợp lệ')
];

exports.validateCancelFlight = [
  param('id').isUUID().withMessage('ID chuyến bay không hợp lệ')
];
