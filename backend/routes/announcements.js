const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { validateCreateAnnouncement } = require('../middlewares/validateAnnouncement');
const { handleValidationErrors } = require('../middlewares/validateUtils');

router.get('/', announcementController.getAll);
router.post('/', validateCreateAnnouncement, handleValidationErrors, announcementController.create);

module.exports = router;