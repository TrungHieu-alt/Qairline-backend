const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { validateBookTicket } = require('../middlewares/validateTicket');
const { handleValidationErrors } = require('../middlewares/validateUtils');

router.post('/', validateBookTicket, handleValidationErrors, ticketController.bookTicket);
router.put('/:id/cancel', ticketController.cancelTicket);
router.get('/track/:code', ticketController.getTicketByCode);

module.exports = router;