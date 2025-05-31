const Aircraft = require('../models/Aircraft');
const db = require('../config/db');
const bcrypt = require('bcrypt');
bcrypt.hash('123456', 10).then(console.log);

class AircraftService {
  async createAircraft(data, user) {
    if (!user || user.role !== 'admin') throw new Error('Only admins can create aircrafts');
    const query = `
      INSERT INTO aircrafts (
        airline_id, aircraft_type, total_first_class_seats,
        total_business_class_seats, total_economy_class_seats,
        status, aircraft_code, manufacturer
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      data.airline_id,
      data.aircraft_type,
      data.total_first_class_seats,
      data.total_business_class_seats,
      data.total_economy_class_seats,
      data.status,
      data.aircraft_code,
      data.manufacturer
    ];
    const result = await db.query(query, values);
    return new Aircraft(result.rows[0]);
  }

  async updateAircraft(id, data, user) {
    if (!user || user.role !== 'admin') throw new Error('Only admins can update aircrafts');
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const query = `
        UPDATE aircrafts
        SET airline_id = $1, aircraft_type = $2, total_first_class_seats = $3,
            total_business_class_seats = $4, total_economy_class_seats = $5,
            status = $6, aircraft_code = $7, manufacturer = $8
        WHERE id = $9
        RETURNING *;
      `;
      const values = [
        data.airline_id,
        data.aircraft_type,
        data.total_first_class_seats,
        data.total_business_class_seats,
        data.total_economy_class_seats,
        data.status,
        data.aircraft_code,
        data.manufacturer,
        id
      ];
      const result = await client.query(query, values);
      if (result.rows.length === 0) throw new Error('Aircraft not found');
      await client.query('COMMIT');
      return new Aircraft(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllAircrafts() {
    const result = await db.query('SELECT * FROM aircrafts');
    return result.rows.map(row => new Aircraft(row));
  }

  async getAircraftById(id) {
    const result = await db.query('SELECT * FROM aircrafts WHERE id = $1', [id]);
    return result.rows.length > 0 ? new Aircraft(result.rows[0]) : null;
  }
}

module.exports = new AircraftService();