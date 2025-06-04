const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validateUtils');

exports.validateCreateAnnouncement = [
  body('title').notEmpty().withMessage('Tiêu đề là bắt buộc'),
  body('content').notEmpty().withMessage('Nội dung là bắt buộc'),
  body('type')
    .notEmpty()
    .withMessage('Loại thông báo là bắt buộc')
    .isIn(['INFO', 'PROMOTION', 'WARNING', 'DELAY', 'MAINTENANCE'])
    .withMessage('Loại thông báo không hợp lệ'),
  body('status')
    .notEmpty()
    .withMessage('Trạng thái là bắt buộc')
    .isIn(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
    .withMessage('Trạng thái không hợp lệ'),
  body('start_date')
    .notEmpty()
    .withMessage('Ngày bắt đầu là bắt buộc')
    .isISO8601()
    .toDate()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  body('end_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Ngày kết thúc không hợp lệ')
    .custom((value, { req }) => {
      if (value && req.body.start_date && new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }
      return true;
    }),

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
    .isIn(['INFO', 'PROMOTION', 'WARNING', 'DELAY', 'MAINTENANCE'])
    .withMessage('Loại thông báo không hợp lệ'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
    .withMessage('Trạng thái không hợp lệ'),
  body('start_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  body('end_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Ngày kết thúc không hợp lệ')
    .custom((value, { req }) => {
      const start = req.body.start_date;
      if (value && start && new Date(value) <= new Date(start)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }
      return true;
    }),
];
exports.validateDeleteAnnouncement = [
  param('id').isUUID().withMessage('ID thông báo không hợp lệ')
];

exports.validateGetAnnouncementById = [
  param('id').isUUID().withMessage('ID thông báo không hợp lệ')
];