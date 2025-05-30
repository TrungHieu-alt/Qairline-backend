const { body } = require('express-validator');

exports.validateBookTicket = [
  body('flight_id').isUUID().withMessage('Invalid flight_id'),
  body('customer_id').isUUID().withMessage('Invalid customer_id'),
  body('ticket_class_id').isUUID().withMessage('Invalid ticket_class_id'),
  body('seat_number').notEmpty().withMessage('Seat number is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('cancellation_deadline')
    .isISO8601().toDate().withMessage('Invalid cancellation deadline')
];