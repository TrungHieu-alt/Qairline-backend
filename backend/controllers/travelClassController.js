const TravelClassService = require('../services/TravelClassService');

class TravelClassController {
  async create(req, res, next) {
    try {
      const travelClass = await TravelClassService.createTravelClass(req.body);
      res.status(201).json({ success: true, data: travelClass });
    } catch (error) {
      throw error;
    }
  }

  async getAll(req, res, next) {
    try {
      const travelClasses = await TravelClassService.getTravelClasses(req.query);
      res.status(200).json({ success: true, data: travelClasses });
    } catch (error) {
      throw error;
    }
  }

  async getById(req, res, next) {
    try {
      const travelClass = await TravelClassService.getTravelClassById(req.params.id);
      if (!travelClass) {
        return res.status(404).json({ success: false, message: 'Travel Class not found' });
      }
      res.status(200).json({ success: true, data: travelClass });
    } catch (error) {
      throw error;
    }
  }

  async update(req, res, next) {
    try {
      const travelClass = await TravelClassService.updateTravelClass(req.params.id, req.body);
      res.status(200).json({ success: true, data: travelClass });
    } catch (error) {
      throw error;
    }
  }

  async delete(req, res, next) {
    try {
      const result = await TravelClassService.deleteTravelClass(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TravelClassController();