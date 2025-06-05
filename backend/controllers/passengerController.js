const PassengerService = require('../services/PassengerService');

class PassengerController {
  async create(req, res, next) {
    try {
      const passenger = await PassengerService.createPassenger(req.body);
      res.status(201).json({ success: true, data: passenger });
    } catch (error) {
      throw error;
    }
  }

  async getAll(req, res, next) {
    try {
      // Allow filtering via query parameters using the search service
      const passengers = await PassengerService.searchPassengers(req.query);
      res.status(200).json({ success: true, data: passengers });
    } catch (error) {
      throw error;
    }
  }

  async getById(req, res, next) {
    try {
      const passenger = await PassengerService.getPassengerById(req.params.id);
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
      const passenger = await PassengerService.updatePassenger(req.params.id, req.body);
      res.status(200).json({ success: true, data: passenger });
    } catch (error) {
      throw error;
    }
  }

  async linkPassengerToUser(req, res, next) {
    try {
      const { passengerId, userId } = req.params;
      const result = await PassengerService.linkPassengerToUser(passengerId, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error); // Use next(error) to pass error to error handling middleware
    }
  }

  async delete(req, res, next) {
    try {
      const result = await PassengerService.deletePassenger(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PassengerController();