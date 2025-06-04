// controllers/AirportController.js
const AirportService = require('../services/AirportService');

class AirportController {
  async getAll(req, res) {
    try {
      const airports = await AirportService.getAirports(req.query);
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data: airports });
    } catch (error) {
      throw error;
    }
  }

  async getById(req, res, next) {
    try {
      const airport = await AirportService.getAirportById(req.params.id);
      if (!airport) {
        return res.status(404).json({ success: false, message: 'Airport not found' });
      }
      res.json({ success: true, data: airport });
    } catch (error) {
      throw error;
    }
  }

  async create(req, res, next) {
    try {
      const airport = await AirportService.createAirport(req.body);
      res.status(201).json({ success: true, data: airport });
    } catch (error) {
      throw error;
    }
  }

  async update(req, res, next) {
    try {
      const airport = await AirportService.updateAirport(req.params.id, req.body);
      res.json({ success: true, data: airport });
    } catch (error) {
      throw error;
    }
  }

  async delete(req, res, next) {
    try {
      const result = await AirportService.deleteAirport(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AirportController();