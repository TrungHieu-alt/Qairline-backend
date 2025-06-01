const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { handleValidationErrors } = require('../middlewares/validateUtils');
const { validateCreateFlight, validateSearchFlights, validateDelayFlight } = require('../middlewares/validateFlight');
const { validateCreateCustomer, validateRegister } = require('../middlewares/validateCustomer');
const { validateLogin } = require('../middlewares/validateLogin');
const {
  validateBookTicket,
  validateBookMultipleTickets,
  validateTicketParams,
  validateTicketCode,
  validateGetTicketsByEmail,
  validateTicketStats
} = require('../middlewares/validateTicket');
const { validateCreateAnnouncement, validateUpdateAnnouncement, validateDeleteAnnouncement } = require('../middlewares/validateAnnouncement');
const { validateCreateAircraft, validateUpdateAircraft, validateGetAircraftById } = require('../middlewares/validateAircraft');
const { validateCreateTicketClass, validateUpdateTicketClass, validateGetPerks } = require('../middlewares/validateTicketClass');

const StatisticController = require('../controllers/statisticController');
const EmployeeAuthController = require('../controllers/employeeAuthController');
const CustomerController = require('../controllers/customerController');
const FlightController = require('../controllers/flightController');
const TicketController = require('../controllers/ticketController');
const CustomerAuthController = require('../controllers/customerAuthController');
const TicketClassController = require('../controllers/ticketClassController');
const AnnouncementController = require('../controllers/announcementController');
const AircraftController = require('../controllers/aircraftController');

// Public routes
router.post('/employee/login', validateLogin, handleValidationErrors, EmployeeAuthController.login);
router.post('/customer/login', validateLogin, handleValidationErrors, CustomerAuthController.login);
router.post('/customer/register', validateRegister, handleValidationErrors, CustomerAuthController.register);
router.post('/flights/search', validateSearchFlights, handleValidationErrors, FlightController.searchFlights);
router.get('/ticket-classes', TicketClassController.getAll);
router.get('/announcements', AnnouncementController.getAll);
router.get('/aircrafts', AircraftController.getAllAircrafts);
router.get('/aircrafts/:id', validateGetAircraftById, handleValidationErrors, AircraftController.getAircraftById);

// Customer routes
router.post('/customer', validateCreateCustomer, handleValidationErrors, CustomerController.createCustomer);
router.post('/tickets/book', validateBookTicket, handleValidationErrors, TicketController.bookTicket);
router.post('/tickets/book-multiple', validateBookMultipleTickets, handleValidationErrors, TicketController.bookMultipleTickets);
router.post('/tickets/:id/cancel', authenticate, authorize(['customer']), validateTicketParams, handleValidationErrors, TicketController.cancelTicket);
router.post('/tickets/:id/confirm', authenticate, authorize(['customer']), validateTicketParams, handleValidationErrors, TicketController.confirmTicket);
router.get('/tickets/code/:code', authenticate, authorize(['customer']), validateTicketCode, handleValidationErrors, TicketController.getTicketByCode);
router.get('/tickets/email/:email', authenticate, authorize(['customer']), validateGetTicketsByEmail, handleValidationErrors, TicketController.getTicketsByEmail);

// Admin routes
router.post('/flights', authenticate, authorize(['admin']), validateCreateFlight, handleValidationErrors, FlightController.createFlight);
router.put('/flights/:id/delay', authenticate, authorize(['admin']), validateDelayFlight, handleValidationErrors, FlightController.delayFlight);
router.post('/aircrafts', authenticate, authorize(['admin']), validateCreateAircraft, handleValidationErrors, AircraftController.createAircraft);
router.put('/aircrafts/:id', authenticate, authorize(['admin']), validateUpdateAircraft, handleValidationErrors, AircraftController.updateAircraft);
router.post('/ticket-classes', authenticate, authorize(['admin']), validateCreateTicketClass, handleValidationErrors, TicketClassController.create);
router.put('/ticket-classes/:id', authenticate, authorize(['admin']), validateUpdateTicketClass, handleValidationErrors, TicketClassController.update);
router.get('/ticket-classes/:id/perks', validateGetPerks, handleValidationErrors, TicketClassController.getPerks);
router.post('/announcements', authenticate, authorize(['admin']), validateCreateAnnouncement, handleValidationErrors, AnnouncementController.create);
router.put('/announcements/:id', authenticate, authorize(['admin']), validateUpdateAnnouncement, handleValidationErrors, AnnouncementController.update);
router.delete('/announcements/:id', authenticate, authorize(['admin']), validateDeleteAnnouncement, handleValidationErrors, AnnouncementController.delete);
router.get('/tickets/stats', authenticate, authorize(['admin']), validateTicketStats, handleValidationErrors, TicketController.getTicketStats);

router.get('/stats', StatisticController.getStats);
router.get('/recent-bookings', StatisticController.getRecentBookings);
router.get('/upcoming-flights', StatisticController.getUpcomingFlights);
router.get('/booking-trends', StatisticController.getBookingTrends);
// Logout routes
router.post('/employee/logout', authenticate, EmployeeAuthController.logout);
router.post('/customer/logout', authenticate, CustomerAuthController.logout);

module.exports = router;