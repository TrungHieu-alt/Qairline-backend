const express = require('express');
const router = express.Router();

// -----------------------------------------------------------------------------
// MIDDLEWARE IMPORTS
// -----------------------------------------------------------------------------
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Validators – grouped by resource
const {
  validateCreateFlight,
  validateSearchFlights,
  validateDelayFlight,
} = require('../middlewares/validateFlight');
const {
  validateCreateCustomer,
  validateRegister,
} = require('../middlewares/validateCustomer');
const { validateLogin } = require('../middlewares/validateLogin');
const {
  validateBookTicket,
  validateBookMultipleTickets,
  validateTicketParams,
  validateTicketCode,
  validateGetTicketsByEmail,
  validateTicketStats,
} = require('../middlewares/validateTicket');
const {
  validateCreateAnnouncement,
  validateUpdateAnnouncement,
  validateDeleteAnnouncement,
} = require('../middlewares/validateAnnouncement');
const {
  validateCreateAircraft,
  validateUpdateAircraft,
  validateGetAircraftById,
} = require('../middlewares/validateAircraft');
const {
  validateCreateTicketClass,
  validateUpdateTicketClass,
  validateGetPerks,
} = require('../middlewares/validateTicketClass');

// -----------------------------------------------------------------------------
// CONTROLLER IMPORTS
// -----------------------------------------------------------------------------
const StatisticController = require('../controllers/statisticController');
const EmployeeAuthController = require('../controllers/employeeAuthController');
const CustomerAuthController = require('../controllers/customerAuthController');
const CustomerController = require('../controllers/customerController');
const FlightController = require('../controllers/flightController');
const TicketController = require('../controllers/ticketController');
const TicketClassController = require('../controllers/ticketClassController');
const AnnouncementController = require('../controllers/announcementController');
const AircraftController = require('../controllers/aircraftController');

// -----------------------------------------------------------------------------
// PUBLIC ROUTES
// -----------------------------------------------------------------------------
router
  // Auth
  .post('/employee/login', validateLogin, handleValidationErrors, EmployeeAuthController.login)
  .post('/customer/login', validateLogin, handleValidationErrors, CustomerAuthController.login)
  .post('/customer/register', validateRegister, handleValidationErrors, CustomerAuthController.register)

  // Flights & lookup data
  .post('/flights/search', validateSearchFlights, handleValidationErrors, FlightController.searchFlights)
  .get('/ticket-classes', TicketClassController.getAll)
  .get('/announcements', AnnouncementController.getAll)
  .get('/aircrafts', AircraftController.getAllAircrafts)
  .get('/aircrafts/:id', validateGetAircraftById, handleValidationErrors, AircraftController.getAircraftById);

// -----------------------------------------------------------------------------
// CUSTOMER ROUTES
// -----------------------------------------------------------------------------
router
  .post('/customer', validateCreateCustomer, handleValidationErrors, CustomerController.createCustomer)

  // Ticket booking & management
  .post('/tickets/book', validateBookTicket, handleValidationErrors, TicketController.bookTicket)
  .post('/tickets/book-multiple', validateBookMultipleTickets, handleValidationErrors, TicketController.bookMultipleTickets)
  .post('/tickets/:id/cancel', authenticate, authorize(['customer']), validateTicketParams, handleValidationErrors, TicketController.cancelTicket)
  .post('/tickets/:id/confirm', authenticate, authorize(['customer']), validateTicketParams, handleValidationErrors, TicketController.confirmTicket)
  .get('/tickets/code/:code', authenticate, authorize(['customer']), validateTicketCode, handleValidationErrors, TicketController.getTicketByCode)
  .get('/tickets/email/:email', authenticate, authorize(['customer']), validateGetTicketsByEmail, handleValidationErrors, TicketController.getTicketsByEmail);

// -----------------------------------------------------------------------------
// ADMIN ROUTES
// -----------------------------------------------------------------------------
// Flights
router
  .post('/flights', authenticate, authorize(['admin']), validateCreateFlight, handleValidationErrors, FlightController.createFlight)
  .put('/flights/:id/delay', authenticate, authorize(['admin']), validateDelayFlight, handleValidationErrors, FlightController.delayFlight)
  .put('/flights/:id/cancel', authenticate, authorize(['admin']), FlightController.cancelFlight)
  .delete('/flights/:id', authenticate, authorize(['admin']), FlightController.deleteFlight);

// Aircrafts
router
  .post('/aircrafts', authenticate, authorize(['admin']), validateCreateAircraft, handleValidationErrors, AircraftController.createAircraft)
  .put('/aircrafts/:id', authenticate, authorize(['admin']), validateUpdateAircraft, handleValidationErrors, AircraftController.updateAircraft)
  .delete('/aircrafts/:id', authenticate, authorize(['admin']), AircraftController.deleteAircraft);

// Ticket Classes
router
  .post('/ticket-classes', authenticate, authorize(['admin']), validateCreateTicketClass, handleValidationErrors, TicketClassController.create)
  .put('/ticket-classes/:id', authenticate, authorize(['admin']), validateUpdateTicketClass, handleValidationErrors, TicketClassController.update)
  .delete('/ticket-classes/:id', authenticate, authorize(['admin']), TicketClassController.delete)
  .get('/ticket-classes/:id/perks', validateGetPerks, handleValidationErrors, TicketClassController.getPerks);

// Announcements
router
  .post('/announcements', authenticate, authorize(['admin']), validateCreateAnnouncement, handleValidationErrors, AnnouncementController.create)
  .put('/announcements/:id', authenticate, authorize(['admin']), validateUpdateAnnouncement, handleValidationErrors, AnnouncementController.update)
  .delete('/announcements/:id', authenticate, authorize(['admin']), validateDeleteAnnouncement, handleValidationErrors, AnnouncementController.delete);

// Statistics
router
  .get('/stats', authenticate, authorize(['admin']), StatisticController.getStats)
  .get('/recent-bookings', authenticate, authorize(['admin']), StatisticController.getRecentBookings)
  .get('/upcoming-flights', authenticate, authorize(['admin']), StatisticController.getUpcomingFlights)
  .get('/booking-trends', authenticate, authorize(['admin']), StatisticController.getBookingTrends)
  .get('/tickets/stats', authenticate, authorize(['admin']), validateTicketStats, handleValidationErrors, TicketController.getTicketStats);

// Customer management (admin)
router
  .put('/customer/:id', authenticate, authorize(['admin']), CustomerController.updateCustomer)
  .delete('/customer/:id', authenticate, authorize(['admin']), CustomerController.deleteCustomer);

// -----------------------------------------------------------------------------
// LOGOUT ROUTES
// -----------------------------------------------------------------------------
router
  .post('/employee/logout', authenticate, EmployeeAuthController.logout)
  .post('/customer/logout', authenticate, CustomerAuthController.logout);

module.exports = router;
