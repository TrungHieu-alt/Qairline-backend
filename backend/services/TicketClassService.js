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

  async create(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO ticket_classes (class_name, coefficient)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const values = [data.class_name, data.coefficient];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return new TicketClass(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE ticket_classes
        SET class_name = $1, coefficient = $2
        WHERE id = $3
        RETURNING *;
      `;
      const values = [data.class_name, data.coefficient, id];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Ticket class not found');
      }

      await client.query('COMMIT');
      return new TicketClass(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = TicketClassService;