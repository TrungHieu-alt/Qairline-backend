const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const Announcement = require('../models/Announcement');
const db = require('../config/db'); // PostgreSQL pool connection
const { hasAvailableSeats } = require('../utils/serviceUtils');

class FlightService {
   /** Lấy toàn bộ chuyến bay, sắp xếp theo giờ khởi hành tăng dần. */
  async getAllFlights() {
    const result = await db.query('SELECT * FROM flights ORDER BY departure_time ASC');
    return result.rows.map(row => new Flight(row));
  }

  /**
   * Lấy chi tiết chuyến bay.
   * @param {number} id - ID chuyến bay.
   * @returns {Promise<Flight|null>}
   */
  async getFlightById(id) {
    const result = await db.query('SELECT * FROM flights WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return new Flight(result.rows[0]);
  }


    /**
   * Tìm chuyến bay theo chặng và ngày.
   * @param {Object} param0 - from_airport_id, to_airport_id, date (YYYY-MM-DD).
   * @returns {Promise<Array>} Danh sách chuyến bay khớp.
   */
  async searchFlights({ from_airport_id, to_airport_id, date }) {
    const query = `
      SELECT
        f.id,
        a.name AS airline_name,
        ac.aircraft_type,
        f.departure_time,
        f.arrival_time
      FROM flights f
      JOIN routes r ON f.route_id = r.id
      JOIN airlines a ON f.airline_id = a.id
      JOIN aircrafts ac ON f.aircraft_id = ac.id
      WHERE r.departure_airport_id = $1
        AND r.arrival_airport_id = $2
        AND DATE(f.departure_time) = $3
        AND f.flight_status != 'Cancelled'
      ORDER BY f.departure_time ASC;
    `;
    const result = await db.query(query, [from_airport_id, to_airport_id, date]);
    return result.rows.map(row => ({
      id: row.id,
      airline_name: row.airline_name,
      aircraft_type: row.aircraft_type,
      departure_time: row.departure_time,
      arrival_time: row.arrival_time
    }));
  }


   /**
   * Trì hoãn chuyến bay, đồng thời:
   * 1. Cập nhật bảng flights.
   * 2. Cập nhật deadline huỷ vé.
   * 3. Tạo thông báo Delay.
   * @param {number} flightId
   * @param {Date} newDeparture
   * @param {Date} newArrival
   * @param {number} createdBy - ID nhân viên thực hiện.
   */
  async delayFlight(flightId, newDeparture, newArrival, createdBy) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Cập nhật bảng flights
      const updateFlightQuery = `
        UPDATE flights
        SET departure_time = $1,
            arrival_time = $2,
            flight_status = 'Delayed'
        WHERE id = $3
        RETURNING *;
      `;
      const flightResult = await client.query(updateFlightQuery, [newDeparture, newArrival, flightId]);
      if (flightResult.rows.length === 0) {
        throw new Error('Flight not found');
      }
      const updatedFlight = new Flight(flightResult.rows[0]);

      // Cập nhật cancellation_deadline trong bảng tickets
      const updateTicketsQuery = `
        UPDATE tickets
        SET cancellation_deadline = $1
        WHERE flight_id = $2
        RETURNING *;
      `;
      const newCancellationDeadline = new Date(newDeparture.getTime() + 60 * 60 * 1000); // +1 giờ
      const ticketsResult = await client.query(updateTicketsQuery, [newCancellationDeadline, flightId]);
      const updatedTickets = ticketsResult.rows.map(row => new Ticket(row));

      // Tạo thông báo mới trong bảng announcements
      const announcementQuery = `
        INSERT INTO announcements (title, content, type, published_date, expiry_date, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const announcementTitle = `Flight ${updatedFlight.flight_number} Delayed`;
      const announcementContent = `Flight ${updatedFlight.flight_number} has been delayed. New departure: ${newDeparture.toISOString()}, New arrival: ${newArrival.toISOString()}.`;
      const announcementType = 'Delay';
      const publishedDate = new Date();
      const expiryDate = new Date(publishedDate.getTime() + 24 * 60 * 60 * 1000); // Hết hạn sau 24 giờ
      const announcementResult = await client.query(announcementQuery, [
        announcementTitle,
        announcementContent,
        announcementType,
        publishedDate,
        expiryDate,
        createdBy
      ]);
      const newAnnouncement = new Announcement(announcementResult.rows[0]);

      await client.query('COMMIT');

      return {
        updatedFlight,
        updatedTickets,
        newAnnouncement
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }


   /**
   * Tạo chuyến bay mới.
   * @param {Object} data - Thông tin chuyến bay.
   * @returns {Promise<Flight>}
   */
  async createFlight(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const flight = new Flight(data);
      const query = `
        INSERT INTO flights (
          airline_id, route_id, aircraft_id, flight_number,
          departure_time, arrival_time, flight_status,
          base_economy_class_price, base_business_class_price, base_first_class_price
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const values = [
        flight.airline_id,
        flight.route_id,
        flight.aircraft_id,
        flight.flight_number,
        flight.departure_time,
        flight.arrival_time,
        flight.flight_status,
        flight.base_economy_class_price,
        flight.base_business_class_price,
        flight.base_first_class_price
      ];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return new Flight(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = FlightService;