const db = require('../config/db');
const crypto = require('crypto');

class ReservationService {
  /**
   * Create a reservation using the existing schema.
   * @param {Object} data
   * @param {string} data.passenger_id - ID of the passenger.
   * @param {string} data.seat_id - ID of the seat being reserved.
   * @param {Object} [data.payment] - Payment info { amount, due_date, status }
   * @returns {Promise<Object>} The created reservation record.
   */
  async createReservation({ passenger_id, seat_id, payment }) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const reservationId = crypto.randomUUID();
      const insertReservation = `
        INSERT INTO reservations (id, passenger_id, seat_id, reservation_date)
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
      `;
      const { rows } = await client.query(insertReservation, [
        reservationId,
        passenger_id,
        seat_id,
      ]);
      const reservation = rows[0];

      if (payment) {
        const { status = 'N', due_date = null, amount } = payment;
        const insertPayment = `
          INSERT INTO payment_statuses (status, due_date, amount, reservation_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW());
        `;
        await client.query(insertPayment, [status, due_date, amount, reservationId]);
      }

      await client.query('COMMIT');
      return reservation;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating reservation:', error.message);
      throw new Error(`Could not create reservation: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Get reservation by ID including payment information.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getReservationById(id) {
    const query = `
      SELECT r.id, r.passenger_id, r.seat_id, r.reservation_date,
             ps.status AS payment_status, ps.amount, ps.due_date
      FROM reservations r
      LEFT JOIN payment_statuses ps ON r.id = ps.reservation_id
      WHERE r.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Cancel a reservation by removing it and related payment record.
   * @param {string} id
   * @returns {Promise<Object>} Deleted reservation data.
   */
  async cancelReservation(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM payment_statuses WHERE reservation_id = $1', [id]);
      const { rows } = await client.query('DELETE FROM reservations WHERE id = $1 RETURNING *', [id]);
      if (rows.length === 0) {
        throw new Error('Reservation not found');
      }
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error cancelling reservation ${id}:`, error.message);
      throw new Error(`Could not cancel reservation: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Get all reservations including payment information.
   * @returns {Promise<Array<Object>>} Array of reservation records.
   */
  async getAllReservations() {
    const query = `
      SELECT r.id, r.passenger_id, r.seat_id, r.reservation_date,
             ps.status AS payment_status, ps.amount, ps.due_date
      FROM reservations r
      LEFT JOIN payment_statuses ps ON r.id = ps.reservation_id;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get reservations by passenger ID including payment information.
   * @param {string} passengerId - ID of the passenger.
   * @returns {Promise<Array<Object>>} Array of reservation records for the passenger.
   */
  async getReservationsByPassengerId(passengerId) {
    const query = `
      SELECT r.id, r.passenger_id, r.seat_id, r.reservation_date,
             ps.status AS payment_status, ps.amount, ps.due_date
      FROM reservations r
      LEFT JOIN payment_statuses ps ON r.id = ps.reservation_id
      WHERE r.passenger_id = $1;
    `;
    const result = await db.query(query, [passengerId]);
    return result.rows;
  }
}

module.exports = new ReservationService();
