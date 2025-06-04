const AircraftService = require('../services/AircraftService');

class AircraftController {
  async createAircraft(req, res, next) {
    try {
      const aircraft = await AircraftService.createAircraft(req.body);
      res.status(201).json({ success: true, data: aircraft });
    } catch (error) {
      throw error;
 // Pass to error handling middleware
    }
  }

  async updateAircraft(req, res, next) {
    try {
      const aircraft = await AircraftService.updateAircraft(req.params.id, req.body);
      res.json({ success: true, data: aircraft });
    } catch (err) {
 next(err); // Pass to error handling middleware
    }
  }

  async getAllAircrafts(req, res, next) {
    try {
      const aircrafts = await AircraftService.getAircrafts(req.query);
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data: aircrafts });
    } catch (error) {
 next(error); // Pass to error handling middleware
    }
  }

  async getAircraftById(req, res, next) {
    try {
      const aircraft = await AircraftService.getAircraftById(req.params.id);
      if (!aircraft) {
        return res.status(404).json({ success: false, message: 'Aircraft not found' });
      }
      res.json({ success: true, data: aircraft });
    } catch (err) {
 next(err); // Pass to error handling middleware
    }
  }

  async deleteAircraft(req, res, next) {
    try {
      const result = await AircraftService.deleteAircraft(req.params.id);
 res.json({ success: true, data: result });
  } catch (err) {
    throw err;
  }
  }
}

module.exports = new AircraftController();