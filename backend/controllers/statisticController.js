const StatisticService = require('../services/StatisticService');

class StatisticController {
  async getStats(req, res, next) {
    try {
      const stats = await StatisticService.getAdminDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  async getRecentBookings(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const bookings = await StatisticService.getRecentReservations(limit);
      res.json({ success: true, data: bookings });
    } catch (err) {
      next(err);
    }
  }

  async getUpcomingFlights(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const flights = await StatisticService.getUpcomingFlights(limit);
      res.json({ success: true, data: flights });
    } catch (err) {
      next(err);
    }
  }

  async getBookingTrends(req, res, next) {
    try {
      const days = parseInt(req.query.days, 10) || 30;
      const trends = await StatisticService.getPaidReservationTrends(days);
      res.json({ success: true, data: trends });
    } catch (err) {
      next(err);
    }
  }

  async getRevenueByTime(req, res, next) {
    try {
      const revenueStats = await StatisticService.getRevenueByTime(req.query);
      res.json({ success: true, data: revenueStats });
    } catch (err) {
      next(err);
    }
  }

  async getRevenueByRoute(req, res, next) {
    try {
      const revenueStats = await StatisticService.getRevenueByRoute(req.query);
      res.json({ success: true, data: revenueStats });
    } catch (err) {
      next(err);
    }
  }

  async getRevenueByAirline(req, res, next) {
    try {
      const revenueStats = await StatisticService.getRevenueByAirline(req.query);
      res.json({ success: true, data: revenueStats });
    } catch (err) {
      next(err);
    }
  }

  async getRevenueByTravelClass(req, res, next) {
    try {
      const revenueStats = await StatisticService.getRevenueByTravelClass(req.query);
      res.json({ success: true, data: revenueStats });
    } catch (err) {
      next(err);
    }
  }

  async getTicketStats(req, res, next) {
    try {
      // Logic to get ticket statistics
      res.json({ success: true, message: 'Ticket stats endpoint', data: {} });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StatisticController();
