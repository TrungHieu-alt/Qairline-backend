const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { validateCreateCustomer } = require('../middlewares/validateCustomer');
const { handleValidationErrors } = require('../middlewares/validateUtils');

router.post('/', validateCreateCustomer, handleValidationErrors, customerController.createCustomer);

module.exports = router;