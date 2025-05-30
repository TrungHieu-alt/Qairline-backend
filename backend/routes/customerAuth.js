const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerAuthController');
const { validateLogin } = require('../middlewares/validateAuth');
const { handleValidationErrors } = require('../middlewares/validateUtils');

router.post('/register', customerController.register);
router.post('/login', validateLogin, handleValidationErrors, customerController.login);
router.post('/logout', customerController.logout);
module.exports = router;