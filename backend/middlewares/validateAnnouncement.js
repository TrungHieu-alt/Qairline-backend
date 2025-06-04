const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreateAnnouncement = [
  body('title').notEmpty().withMessage('Tiêu đề là bắt buộc'),
  body('content').notEmpty().withMessage('Nội dung là bắt buộc'),
 body('type')
 .notEmpty().withMessage('Loại thông báo là bắt buộc')
 .isIn(['INFO', 'PROMOTION', 'WARNING', 'DELAY']).withMessage('Loại thông báo không hợp lệ'),

];

exports.validateUpdateAnnouncement = [
  param('id').isUUID().withMessage('ID thông báo không hợp lệ'),
 body('title')
 .optional()
 .notEmpty().withMessage('Tiêu đề không được rỗng nếu có'),
 body('content')
 .optional()
 .notEmpty().withMessage('Nội dung không được rỗng nếu có'),
 body('type')
    .optional()
    .isIn(['INFO', 'PROMOTION', 'WARNING', 'DELAY']).withMessage('Loại thông báo không hợp lệ'),
];
exports.validateDeleteAnnouncement = [
  param('id').isUUID().withMessage('ID thông báo không hợp lệ')
];

exports.validateGetAnnouncementById = [
  param('id').isUUID().withMessage('ID thông báo không hợp lệ')
];