const { body } = require('express-validator');


exports.validateCreateAnnouncement = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('expiry_date')
    .isISO8601().toDate().withMessage('Invalid expiry date'),
  body('created_by')
    .isUUID().withMessage('Invalid created_by')
];