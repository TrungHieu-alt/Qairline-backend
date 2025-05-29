const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

router.get('/', flightController.getAllFlights);
router.get('/:id', flightController.getFlightById);
router.get('/search/one-way', flightController.searchOneWay);
router.get('/search/round-trip', flightController.searchRoundTrip);
router.put('/:id/delay', flightController.delayFlight);

module.exports = router;