const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeAuthController');
const { validateLogin } = require('../middlewares/validateAuth');
const { handleValidationErrors } = require('../middlewares/validateUtils');

router.post('/login', validateLogin, handleValidationErrors, employeeController.login);
router.post('/logout', employeeController.logout);
module.exports = router;