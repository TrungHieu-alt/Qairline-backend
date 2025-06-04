const AirlineService = require('../services/AirlineService');

class AirlineController {
  async getAll(req, res) {
    try {
      const airlines = await AirlineService.getAirlines(req.query);
      res.set('Cache-Control', 'no-store').json({ success: true, data: airlines });
    } catch (error) {
      throw error;
    }
  }

  async getById(req, res, next) {
    try {
      const airline = await AirlineService.getAirlineById(req.params.id);
      if (!airline) {
        return res.status(404).json({ success: false, message: 'Airline not found' });
      }
      res.json({ success: true, data: airline });
    } catch (error) {
      throw error;
    }
  }

  async create(req, res, next) {
    try {
      const airline = await AirlineService.createAirline(req.body);
      res.status(201).json({ success: true, data: airline });
    } catch (error) {
      throw error;
    }
  }

  async update(req, res, next) {
    try {
      const airline = await AirlineService.updateAirline(req.params.id, req.body);
      res.json({ success: true, data: airline });
    } catch (error) {
      throw error;
    }
  }

  async delete(req, res, next) {
    try {
      const result = await AirlineService.deleteAirline(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AirlineController();