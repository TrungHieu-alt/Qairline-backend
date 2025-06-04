const PassengerService = require('../services/PassengerService');

class PassengerController {
  async create(req, res, next) {
    try {
      const passenger = await PassengerService.create(req.body);
      res.status(201).json({ success: true, data: passenger });
    } catch (error) {
      throw error;
    }
  }

  async getAll(req, res, next) {
    try {
      const passengers = await PassengerService.getAll();
      res.status(200).json({ success: true, data: passengers });
    } catch (error) {
      throw error;
    }
  }

  async getById(req, res, next) {
    try {
      const passenger = await PassengerService.getById(req.params.id);
      if (!passenger) {
        return res.status(404).json({ success: false, message: 'Passenger not found' });
      }
      res.status(200).json({ success: true, data: passenger });
    } catch (error) {
      throw error;
    }
  }

  async update(req, res, next) {
    try {
      const passenger = await PassengerService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: passenger });
    } catch (error) {
      throw error;
    }
  }

  async delete(req, res, next) {
    try {
      const result = await PassengerService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PassengerController();