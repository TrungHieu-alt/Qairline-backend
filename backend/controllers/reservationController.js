const ReservationService = require('../services/ReservationService');

class ReservationController {
  async create(req, res, next) {
    try {
      const reservation = await ReservationService.createReservation(req.body);
      res.status(201).json({ success: true, data: reservation });
    } catch (error) {
      throw error;
    }
  }

  async getById(req, res, next) {
    try {
      const reservation = await ReservationService.getReservationById(req.params.id);
      if (!reservation) {
        return res.status(404).json({ success: false, message: 'Reservation not found' });
      }
      res.status(200).json({ success: true, data: reservation });
    } catch (error) {
      throw error;
    }
  }

  async cancel(req, res, next) {
    try {
      const cancelledReservation = await ReservationService.cancelReservation(req.params.id);
      res.status(200).json({ success: true, data: cancelledReservation });
    } catch (error) {
      throw error;
    }
  }

  async getAll(req, res, next) {
    try {
      const reservations = await ReservationService.getAllReservations();
      res.status(200).json({ success: true, data: reservations });
    } catch (error) {
      throw error;
    }
  }

  async getReservationsByPassengerId(req, res, next) {
    try {
      const reservations = await ReservationService.getReservationsByPassengerId(req.params.passengerId);
      res.status(200).json({ success: true, data: reservations });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReservationController();