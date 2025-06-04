const { body, param, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreateServiceOffering = [
  body('travel_class_id')
    .notEmpty().withMessage('travel_class_id is required')
    .isUUID().withMessage('Invalid travel_class_id UUID format'),
  body('service_id')
    .notEmpty().withMessage('service_id is required')
    .isUUID().withMessage('Invalid service_id UUID format'),
  body('is_offered')
    .notEmpty().withMessage('is_offered is required')
    .isBoolean().withMessage('is_offered must be a boolean'),
  body('from_month')
    .notEmpty().withMessage('from_month is required')
    .isString().withMessage('from_month must be a string'),
  body('to_month')
    .notEmpty().withMessage('to_month is required')
    .isString().withMessage('to_month must be a string'),
];

exports.validateUpdateServiceOffering = [
  param('travelClassId')
    .notEmpty().withMessage('travelClassId in param is required')
    .isUUID().withMessage('Invalid travelClassId UUID format in param'),
  param('serviceId')
    .notEmpty().withMessage('serviceId in param is required')
    .isUUID().withMessage('Invalid serviceId UUID format in param'),
  body('is_offered')
    .optional()
    .isBoolean().withMessage('is_offered must be a boolean'),
  body('from_month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('from_month must be an integer between 1 and 12'),
  body('to_month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('to_month must be an integer between 1 and 12')
    .custom((value, { req }) => {
      // Only perform the check if both from_month and to_month are provided in the body
      const fromMonth = req.body.from_month !== undefined ? req.body.from_month : null;
      const toMonth = value !== undefined ? value : null;

      if (fromMonth !== null && toMonth !== null && toMonth < fromMonth) {
          throw new Error('to_month must be greater than or equal to from_month when both are provided');
      }
      return true;
    }),
];

exports.validateGetServiceOfferingById = [
  param('travelClassId')
    .notEmpty().withMessage('travelClassId in param is required')
    .isUUID().withMessage('Invalid travelClassId UUID format in param'),
  param('serviceId')
    .notEmpty().withMessage('serviceId in param is required')
    .isUUID().withMessage('Invalid serviceId UUID format in param'),
];

exports.validateDeleteServiceOffering = [
  param('travelClassId')
    .notEmpty().withMessage('travelClassId in param is required')
    .isUUID().withMessage('Invalid travelClassId UUID format in param'),
  param('serviceId')
    .notEmpty().withMessage('serviceId in param is required')
    .isUUID().withMessage('Invalid serviceId UUID format in param'),
];


// Middleware xử lý lỗi validation (assuming it will be moved later)
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('❌ Validation Errors:', errors.array()); // Use error for errors
    return res.status(400).json({ success: false, error: errors.array().map(err => err.msg).join(', ') }); // Return all error messages
  }
  next();
};