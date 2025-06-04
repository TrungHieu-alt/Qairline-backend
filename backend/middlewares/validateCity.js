const { body, param, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreateCity = [
  body('name').notEmpty().withMessage('Name is required'),
  body('country_id').isUUID().withMessage('Invalid country ID')
];

exports.validateUpdateCity = [
  param('id').isUUID().withMessage('Invalid city ID'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('country_id').optional().isUUID().withMessage('Invalid country ID')
];

exports.validateGetCityById = [
  param('id').isUUID().withMessage('Invalid city ID')
];

exports.validateDeleteCity = [
  param('id').isUUID().withMessage('Invalid city ID')
];

exports.validateGetAllCities = [
  // Add validation rules for query parameters here if needed
];