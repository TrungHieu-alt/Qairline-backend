const express = require('express');
const { validateCreateFlight } = require('../middlewares/validateFlight');
const { handleValidationErrors } = require('../middlewares/validateUtils');
const router = express.Router();
const flightController = require('../controllers/flightController');

router.get('/', flightController.getAllFlights);
router.get('/:id', flightController.getFlightById);
router.post('/search', flightController.searchFlights);
router.put('/:id/delay', flightController.delayFlight);
router.post('/', validateCreateFlight, handleValidationErrors, flightController.createFlight);
module.exports = router;