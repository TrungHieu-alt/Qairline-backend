const { body } = require('express-validator');

exports.validateCreateFlight = [
  body('airline_id').isUUID().withMessage('Invalid airline_id'),
  body('route_id').isUUID().withMessage('Invalid route_id'),
  body('aircraft_id').isUUID().withMessage('Invalid aircraft_id'),
  body('flight_number')
    .notEmpty().withMessage('Flight number is required')
    .isLength({ max: 10 }).withMessage('Flight number too long'),
  body('departure_time')
    .isISO8601().toDate().withMessage('Invalid departure time'),
  body('arrival_time')
    .isISO8601().toDate().withMessage('Invalid arrival time')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.departure_time)) {
        throw new Error('Arrival time must be after departure time');
      }
      return true;
    }),
  body('base_economy_class_price')
    .isFloat({ min: 0 }).withMessage('Economy price must be non-negative'),
  body('base_business_class_price')
    .isFloat({ min: 0 }).withMessage('Business price must be non-negative'),
  body('base_first_class_price')
    .isFloat({ min: 0 }).withMessage('First class price must be non-negative'),
  body('flight_status')
    .optional()
    .isIn(['Scheduled', 'Delayed', 'Cancelled', 'Completed'])
    .withMessage('Invalid flight status')
];