const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../middlewares/validateAuth');
const { handleValidationErrors } = require('../middlewares/validateUtils');

router.post('/login', validateLogin, handleValidationErrors, authController.login);

module.exports = router;