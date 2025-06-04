const AircraftTypeService = require('../services/AircraftTypeService');

class AircraftTypeController {
  async getAllAircraftTypes(req, res, next) {
    try {
      const options = req.query; // Assuming pagination and filtering options are in the query string
      const aircraftTypes = await AircraftTypeService.getAircraftTypes(options);
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data: aircraftTypes.data, total: aircraftTypes.total });
    } catch (error) {
      next(error);
    }
  }

  async getAircraftTypeById(req, res, next) {
    try {
      const aircraftType = await AircraftTypeService.getAircraftTypeById(req.params.id);
      if (!aircraftType) {
        return res.status(404).json({ success: false, message: 'Aircraft type not found' });
      }
      res.json({ success: true, data: aircraftType });
    } catch (error) {
      next(error);
    }
  }

  async createAircraftType(req, res, next) {
    try {
      const aircraftType = await AircraftTypeService.createAircraftType(req.body);
      res.status(201).json({ success: true, data: aircraftType });
    } catch (error) {
      next(error);
    }
  }

  async updateAircraftType(req, res, next) {
    try {
      const aircraftType = await AircraftTypeService.updateAircraftType(req.params.id, req.body);
      res.json({ success: true, data: aircraftType });
    } catch (error) {
      next(error);
    }
  }

  async deleteAircraftType(req, res, next) {
    try {
      const result = await AircraftTypeService.deleteAircraftType(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AircraftTypeController();