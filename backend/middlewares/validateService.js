const { body, param, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreateService = [
  body('name').notEmpty().withMessage('Service name is required'),
  body('description').optional(),
  body('price')
    .notEmpty().withMessage('Service price is required')
    .isFloat({ min: 0 }).withMessage('Service price must be a non-negative number')
];

exports.validateUpdateService = [
  param('id').isUUID().withMessage('Invalid service ID'),
  body('name').optional().notEmpty().withMessage('Service name cannot be empty'),
  body('description').optional(),
  body('price').optional()
    .isFloat({ min: 0 }).withMessage('Service price must be a non-negative number')
];

exports.validateGetServiceById = [
  param('id').isUUID().withMessage('Invalid service ID')
];

exports.validateDeleteService = [
  param('id').isUUID().withMessage('Invalid service ID')
];
