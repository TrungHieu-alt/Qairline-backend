const FlightService = require('../services/FlightService');

class FlightController {
  async getAllFlights(req, res, next) {
    try {
      const flights = await FlightService.getAllFlights();
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data: flights });
    } catch (error) {
      next(error);
    }
  }

  async getFlightById(req, res, next) {
    try {
      const flight = await FlightService.getFlightById(req.params.id);
      res.set('Cache-Control', 'no-store');
      if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
      res.json({ success: true, data: flight });
    } catch (error) {
      next(error);
    }
  }

  async searchFlights(req, res, next) {
    try {
      const results = await FlightService.searchFlights(req.body);
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }

  async delayFlight(req, res, next) {
    try {
      const { newDeparture, newArrival } = req.body;
      const updated = await FlightService.delayFlight(req.params.id, newDeparture, newArrival);
      if (!updated) return res.status(404).json({ success: false, message: 'Flight not found' });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async createFlight(req, res, next) {
    try {
      const flight = await FlightService.createFlight(req.body);
      res.status(201).json({ success: true, data: flight });
    } catch (error) {
      next(error);
    }
  }

  async cancelFlight(req, res, next) {
  try {
    const flight = await FlightService.cancelFlight(req.params.id);
    res.json({ success: true, data: flight });
  } catch (err) {
    next(err);
  }

  async deleteFlight(req, res, next) {
  try {
    const result = await FlightService.deleteFlight(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = new FlightController();
