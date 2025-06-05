const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { handleValidationErrors } = require('../middlewares/validateUtils');

// Controllers
const AuthController = require('../controllers/authController');
const AircraftController = require('../controllers/aircraftController');
const AirlineController = require('../controllers/airlineController');
const AirportController = require('../controllers/airportController');
const AnnouncementController = require('../controllers/announcementController');
const FlightController = require('../controllers/flightController');
const PassengerController = require('../controllers/passengerController');
const ReservationController = require('../controllers/reservationController');
const ServiceOfferingController = require('../controllers/serviceOfferingController');
const TravelClassController = require('../controllers/travelClassController');
const CityController = require('../controllers/cityController');
const CountryController = require('../controllers/countryController');
const StatisticController = require('../controllers/statisticController');
// Add ServiceController here when available

// Add serviceController instance here when available


// Validation Middleware
const { validateRegister, validateLogin } = require('../middlewares/validateAuth');
const { validateCreateAircraft, validateUpdateAircraft, validateGetAircraftById } = require('../middlewares/validateAircraft');
const { validateCreateAirline, validateUpdateAirline, validateGetAirlineById, validateDeleteAirline } = require('../middlewares/validateAirline'); // Assuming these exist or will be created
const { validateCreateAirport, validateUpdateAirport, validateGetAirportById, validateDeleteAirport } = require('../middlewares/validateAirport'); // Assuming these exist or will be created
const { validateCreateAnnouncement, validateUpdateAnnouncement, validateDeleteAnnouncement, validateGetAnnouncementById } = require('../middlewares/validateAnnouncement'); // Assuming GetById exists or will be created
const { validateCreateFlight, validateSearchFlights, validateDelayFlight, validateGetFlightById, validateCancelFlight, validateDeleteFlight } = require('../middlewares/validateFlight'); // Assuming other validations exist or will be created
const { validateCreatePassenger, validateUpdatePassenger, validateGetPassengerById, validateDeletePassenger } = require('../middlewares/validatePassenger');
const { validateCreateReservation, validateGetReservationById, validateCancelReservation, validateGetReservationsByPassengerId } = require('../middlewares/validateReservation');
const { validateCreateServiceOffering, validateGetServiceOfferingById, validateUpdateServiceOffering, validateDeleteServiceOffering } = require('../middlewares/validateServiceOffering');
const { validateCreateCity, validateUpdateCity, validateGetCityById, validateDeleteCity, validateGetAllCities } = require('../middlewares/validateCity'); // Assuming GetAll exists or will be created
const { validateCreateCountry, validateUpdateCountry, validateGetCountryById, validateDeleteCountry, validateGetAllCountries } = require('../middlewares/validateCountry'); // Assuming GetAll exists or will be created
const { validateCreateTravelClass, validateUpdateTravelClass, validateGetTravelClassById, validateDeleteTravelClass } = require('../middlewares/validateTravelClass');


// Auth Routes
router.post('/auth/register', validateRegister, handleValidationErrors, AuthController.registerPassenger);
router.post('/auth/login', validateLogin, handleValidationErrors, AuthController.login);

// Aircraft Routes (Admin only for create/update/delete)
router.get('/aircrafts', AircraftController.getAllAircrafts);
router.get('/aircrafts/:id', validateGetAircraftById, handleValidationErrors, AircraftController.getAircraftById);
router.post('/aircrafts', authenticate, authorize(['admin']), validateCreateAircraft, handleValidationErrors, AircraftController.createAircraft);
router.put('/aircrafts/:id', authenticate, authorize(['admin']), validateUpdateAircraft, handleValidationErrors, AircraftController.updateAircraft);
router.delete('/aircrafts/:id', authenticate, authorize(['admin']), validateGetAircraftById, handleValidationErrors, AircraftController.deleteAircraft);

// Airline Routes (Admin only for create/update/delete)
router.get('/airlines', AirlineController.getAll);
router.get('/airlines/:id', validateGetAirlineById, handleValidationErrors, AirlineController.getById); // Assuming validateGetAirlineById exists
router.post('/airlines', authenticate, authorize(['admin']), validateCreateAirline, handleValidationErrors, AirlineController.create); // Assuming validateCreateAirline exists
router.put('/airlines/:id', authenticate, authorize(['admin']), validateUpdateAirline, handleValidationErrors, AirlineController.update); // Assuming validateUpdateAirline exists
router.delete('/airlines/:id', authenticate, authorize(['admin']), validateGetAirlineById, handleValidationErrors, AirlineController.delete); // Assuming validateGetAirlineById exists

// Airport Routes (Admin only for create/update/delete)
router.get('/airports', AirportController.getAll);
router.get('/airports/:id', validateGetAirportById, handleValidationErrors, AirportController.getById); // Assuming validateGetAirportById exists
router.post('/airports', authenticate, authorize(['admin']), validateCreateAirport, handleValidationErrors, AirportController.create); // Assuming validateCreateAirport exists
router.put('/airports/:id', authenticate, authorize(['admin']), validateUpdateAirport, handleValidationErrors, AirportController.update); // Assuming validateUpdateAirport exists
router.delete('/airports/:id', authenticate, authorize(['admin']), validateGetAirportById, handleValidationErrors, AirportController.delete); // Assuming validateGetAirportById exists

// Announcement Routes (Admin only for create/update/delete)
router.get('/announcements', AnnouncementController.getAll);
router.get('/announcements/:id', validateGetAnnouncementById, handleValidationErrors, AnnouncementController.getAnnouncementById); // Assuming validateGetAnnouncementById exists
router.post('/announcements', authenticate, authorize(['admin']), validateCreateAnnouncement, handleValidationErrors, AnnouncementController.create);
router.put('/announcements/:id', authenticate, authorize(['admin']), validateUpdateAnnouncement, handleValidationErrors, AnnouncementController.update);
router.delete('/announcements/:id', authenticate, authorize(['admin']), validateDeleteAnnouncement, handleValidationErrors, AnnouncementController.delete);

// Flight Routes (Admin for create/update/delete/cancel/delay, Public for search/get)
router.get('/flights', FlightController.getAllFlights);
router.get('/flights/:id', validateGetFlightById, handleValidationErrors, FlightController.getFlightById); // Assuming validateGetFlightById exists
router.post('/flights/search', validateSearchFlights, handleValidationErrors, FlightController.searchFlights);
router.post('/flights', authenticate, authorize(['admin']), validateCreateFlight, handleValidationErrors, FlightController.createFlight);
router.put('/flights/:id/delay', authenticate, authorize(['admin']), validateDelayFlight, handleValidationErrors, (req, res, next) => FlightController.delayFlight(req, res, next));
router.put('/flights/:id/cancel', authenticate, authorize(['admin']), validateCancelFlight, handleValidationErrors, FlightController.cancelFlight); // Assuming validateCancelFlight exists
router.delete('/flights/:id', authenticate, authorize(['admin']), validateDeleteFlight, handleValidationErrors, FlightController.deleteFlight); // Assuming validateDeleteFlight exists

// Passenger Routes (Admin only for CRUD)
router.get('/passengers', authenticate, authorize(['admin']), PassengerController.getAll);
router.get('/passengers/:id', authenticate, authorize(['admin']), validateGetPassengerById, handleValidationErrors, PassengerController.getById);
router.post('/passengers', authenticate, authorize(['admin']), validateCreatePassenger, handleValidationErrors, PassengerController.create);
router.put('/passengers/:id', authenticate, authorize(['admin']), validateUpdatePassenger, handleValidationErrors, PassengerController.update);
router.delete('/passengers/:id', authenticate, authorize(['admin']), validateGetPassengerById, handleValidationErrors, PassengerController.delete);

// Reservation Routes (Passenger for create/cancel/get by passenger, Admin for getById/getAll)
router.post('/reservations', authenticate, authorize(['passenger']), validateCreateReservation, handleValidationErrors, ReservationController.create);
router.get('/reservations/:id', authenticate, validateGetReservationById, handleValidationErrors, ReservationController.getById); // Auth for passenger or admin
router.put('/reservations/:id/cancel', authenticate, authorize(['passenger']), validateCancelReservation, handleValidationErrors, ReservationController.cancel); // Assuming validateCancelReservation exists
router.get('/passengers/:passengerId/reservations', authenticate, authorize(['passenger', 'admin']), validateGetReservationsByPassengerId, handleValidationErrors, ReservationController.getReservationsByPassengerId);
router.get('/reservations', authenticate, authorize(['admin']), ReservationController.getAll); // Assuming getAll method in ReservationController

// Travel Class Routes (Admin for create/update/delete, Public for get)
router.get('/ticket-classes', TravelClassController.getAll);
router.get('/ticket-classes/:id', validateGetTravelClassById, handleValidationErrors, TravelClassController.getById);
router.post('/ticket-classes', authenticate, authorize(['admin']), validateCreateTravelClass, handleValidationErrors, TravelClassController.create);
router.put('/ticket-classes/:id', authenticate, authorize(['admin']), validateUpdateTravelClass, handleValidationErrors, TravelClassController.update);
router.delete('/ticket-classes/:id', authenticate, authorize(['admin']), validateDeleteTravelClass, handleValidationErrors, TravelClassController.delete);

// Service Offering Routes (Admin only for CRUD)
router.get('/service-offerings', ServiceOfferingController.getAll);
router.get('/service-offerings/:travelClassId/:serviceId', validateGetServiceOfferingById, handleValidationErrors, ServiceOfferingController.getById); // Assuming validateGetServiceOfferingById exists and handles composite key
router.post('/service-offerings', authenticate, authorize(['admin']), validateCreateServiceOffering, handleValidationErrors, ServiceOfferingController.create);
router.put('/service-offerings/:travelClassId/:serviceId', authenticate, authorize(['admin']), validateUpdateServiceOffering, handleValidationErrors, ServiceOfferingController.update); // Assuming validateUpdateServiceOffering exists and handles composite key
router.delete('/service-offerings/:travelClassId/:serviceId', authenticate, authorize(['admin']), validateGetServiceOfferingById, handleValidationErrors, ServiceOfferingController.delete); // Using GetById validation for delete with composite key

// City Routes (Admin only for create/update/delete, Public for getAll)
router.get('/cities', CityController.getAll);
router.get('/cities/:id', authenticate, authorize(['admin']), validateGetCityById, handleValidationErrors, CityController.getById); // Assuming validateGetCityById exists
router.post('/cities', authenticate, authorize(['admin']), validateCreateCity, handleValidationErrors, CityController.create); // Assuming validateCreateCity exists
router.put('/cities/:id', authenticate, authorize(['admin']), validateUpdateCity, handleValidationErrors, CityController.update); // Assuming validateUpdateCity exists
router.delete('/cities/:id', authenticate, authorize(['admin']), validateGetCityById, handleValidationErrors, CityController.delete); // Using GetById validation for delete

// Country Routes (Admin only for create/update/delete, Public for getAll)
router.get('/countries', CountryController.getAll);
router.get('/countries/:id', authenticate, authorize(['admin']), validateGetCountryById, handleValidationErrors, CountryController.getById); // Assuming validateGetCountryById exists
router.post('/countries', authenticate, authorize(['admin']), validateCreateCountry, handleValidationErrors, CountryController.create); // Assuming validateCreateCountry exists
router.put('/countries/:id', authenticate, authorize(['admin']), validateUpdateCountry, handleValidationErrors, CountryController.update); // Assuming validateUpdateCountry exists
router.delete('/countries/:id', authenticate, authorize(['admin']), validateGetCountryById, handleValidationErrors, CountryController.delete); // Using GetById validation for delete

// Statistic Routes (Admin only)
router.get('/stats', authenticate, authorize(['admin']), StatisticController.getStats);
router.get('/recent-bookings', authenticate, authorize(['admin']), StatisticController.getRecentBookings);
router.get('/upcoming-flights', authenticate, authorize(['admin']), StatisticController.getUpcomingFlights);
router.get('/booking-trends', authenticate, authorize(['admin']), StatisticController.getBookingTrends);

// Add Service Routes here when ServiceController and ServiceService are available

module.exports = router;