const { body, param } = require('express-validator');

exports.validateCreateAnnouncement = [
  body('title').notEmpty().withMessage('Tiêu đề là bắt buộc'),
  body('content').notEmpty().withMessage('Nội dung là bắt buộc'),
  body('type').notEmpty().withMessage('Loại thông báo là bắt buộc'),
  body('expiry_date')
    .isISO8601()
    .toDate()
    .withMessage('Ngày hết hạn không hợp lệ'),
  body('created_by')
    .isUUID()
    .withMessage('ID người tạo không hợp lệ')
];

exports.validateUpdateAnnouncement = [
  param('id').isUUID().withMessage('ID thông báo không hợp lệ'),
  body('title').notEmpty().withMessage('Tiêu đề là bắt buộc'),
  body('content').notEmpty().withMessage('Nội dung là bắt buộc'),
  body('type').notEmpty().withMessage('Loại thông báo là bắt buộc'),
  body('expiry_date')
    .isISO8601()
    .toDate()
    .withMessage('Ngày hết hạn không hợp lệ'),
  body('created_by')
    .isUUID()
    .withMessage('ID người tạo không hợp lệ')
];

exports.validateDeleteAnnouncement = [
  param('id').isUUID().withMessage('ID thông báo không hợp lệ')
];