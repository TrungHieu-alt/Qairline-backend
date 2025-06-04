const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreateCountry = [
  body('name').notEmpty().withMessage('Name is required'),
  body('code')
    .notEmpty().withMessage('Code is required')
    .isString().withMessage('Code must be a string')
    .trim()
    .toUpperCase()
    .isLength({ min: 2, max: 2 }).withMessage('Code must be a 2-letter ISO 3166-1 alpha-2 code'),
];

exports.validateUpdateCountry = [
  param('id').isUUID().withMessage('Country ID is invalid'),
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .trim(),
  body('code')
    .optional()
    .isString().withMessage('Code must be a string')
    .trim()
    .toUpperCase()
    .isLength({ min: 2, max: 2 }).withMessage('Code must be a 2-letter ISO 3166-1 alpha-2 code'),
];

exports.validateGetCountryById = [
  param('id').isUUID().withMessage('Country ID is invalid'),
];

exports.validateDeleteCountry = [
  param('id').isUUID().withMessage('Country ID is invalid'),
];


exports.validateGetAllCountries = [
  // Add validation rules for query parameters here if needed
];