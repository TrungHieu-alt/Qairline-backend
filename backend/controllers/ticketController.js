const ticketService = require('../services/TicketService');

exports.bookTicket = async (req, res) => {
  try {
    const ticket = await ticketService.bookTicket(req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.bookMultipleTickets = async (req, res) => {
  try {
    const tickets = await ticketService.bookTicketWithCustomer(req.body, req.user);
    res.status(201).json({ success: true, data: tickets });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.cancelTicket = async (req, res) => {
  try {
    const cancelled = await ticketService.cancelTicket(req.params.id, req.user?.email);
    res.json({ success: true, data: cancelled });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.confirmTicket = async (req, res) => {
  try {
    const ticket = await ticketService.confirmTicket(req.params.id);
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getTicketByCode = async (req, res) => {
  try {
    const ticket = await ticketService.getTicketByCode(req.params.code);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getTicketsByEmail = async (req, res) => {
  try {
    const tickets = await ticketService.getTicketsByEmail(req.params.email);
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    const stats = await ticketService.getTicketStats(req.query);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};