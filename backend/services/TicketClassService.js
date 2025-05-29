const TicketClass = require('../models/TicketClass');
const Perk = require('../models/Perk');
const db = require('../config/db');

class TicketClassService {
  async getAll() {
    const result = await db.query('SELECT * FROM ticket_classes');
    return result.rows.map(row => new TicketClass(row));
  }

  async getPerksForTicketClass(ticketClassId) {
    const query = `
      SELECT p.* FROM perks p
      JOIN ticket_class_perks tcp ON p.id = tcp.perk_id
      WHERE tcp.ticket_class_id = $1
    `;
    const result = await db.query(query, [ticketClassId]);
    return result.rows.map(row => new Perk(row));
  }
}

module.exports = TicketClassService;
