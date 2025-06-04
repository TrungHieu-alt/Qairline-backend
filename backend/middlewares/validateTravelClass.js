const { body, param, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreateTravelClass = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string')
];

exports.validateUpdateTravelClass = [
  param('id').isUUID().withMessage('Invalid Travel Class ID'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string')
];

exports.validateGetTravelClassById = [
  param('id').isUUID().withMessage('Invalid Travel Class ID')
];

exports.validateDeleteTravelClass = [
  param('id').isUUID().withMessage('Invalid Travel Class ID')
];
