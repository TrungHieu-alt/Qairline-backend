const db = require('../config/db');

class AircraftService {

  /**
   * Lấy danh sách máy bay cụ thể với tùy chọn phân trang và lọc.
   * @param {Object} options - Tùy chọn: page, limit, airlineId, aircraftTypeId, registrationKeyword
   * @returns {Promise<Object>} - { data: [], total: number }
   */
  async getAircrafts(options = {}) {
    const {
      page = 1,
      limit = 10,
      airlineId,           // Filter by airline_id
      aircraftTypeId,    // Filter by aircraft_type_id
      registrationKeyword  // Filter by keyword in registration_number
    } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, airline_id, aircraft_type_id, registration_number
      FROM aircrafts
      WHERE 1=1 -- Start with a true condition to easily append others
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM aircrafts
      WHERE 1=1
    `;

    const filterValues = [];
    const countFilterValues = [];
    let paramIndex = 1;

    // Filter by airline_id
    if (airlineId) {
        query += ` AND airline_id = $${paramIndex}`;
        countQuery += ` AND airline_id = $${paramIndex}`;
        filterValues.push(airlineId);
        countFilterValues.push(airlineId);
        paramIndex++;
    }

    // Filter by aircraft_type_id
    if (aircraftTypeId) {
        query += ` AND aircraft_type_id = $${paramIndex}`;
        countQuery += ` AND aircraft_type_id = $${paramIndex}`;
        filterValues.push(aircraftTypeId);
        countFilterValues.push(aircraftTypeId);
        paramIndex++;
    }

    // Filter by registration_number keyword (case-insensitive)
    if (registrationKeyword) {
        query += ` AND registration_number ILIKE $${paramIndex}`;
        countQuery += ` AND registration_number ILIKE $${paramIndex}`;
        filterValues.push(`%${registrationKeyword}%`);
        countFilterValues.push(`%${registrationKeyword}%`);
        paramIndex++;
    }

    // Add other filters here if needed

    query += `
      ORDER BY registration_number ASC -- Default order
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    filterValues.push(limit);
    filterValues.push(offset);


    try {
      const result = await db.query(query, filterValues);
      const countResult = await db.query(countQuery, countFilterValues);

      return {
          data: result.rows,
          total: parseInt(countResult.rows[0].count, 10)
      };

    } catch (error) {
      console.error('❌ Error fetching aircrafts:', error.message);
      throw new Error(`Could not fetch aircrafts: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết máy bay cụ thể theo ID.
   * @param {string} id - UUID máy bay.
   * @returns {Promise<Object|null>}
   */
   async getAircraftById(id) {
       try {
           const query = `
                SELECT id, airline_id, aircraft_type_id, registration_number
                FROM aircrafts
                WHERE id = $1;
           `;
           const result = await db.query(query, [id]); // UUID id
           if (result.rows.length === 0) {
               return null; // Aircraft not found
           }
           return result.rows[0];
       } catch (error) {
           console.error(`❌ Error fetching aircraft by ID ${id}:`, error.message);
           throw new Error(`Could not fetch aircraft by ID: ${error.message}`);
       }
   }

  /**
   * Tạo máy bay cụ thể mới.
   * @param {Object} data - airline_id (UUID), aircraft_type_id (UUID), registration_number.
   * @returns {Promise<Object>} Máy bay đã tạo.
   */
  async createAircraft(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation (e.g., airline_id, aircraft_type_id, registration_number are required)
      // TODO: Validate if airline_id and aircraft_type_id exist in their respective tables

      const query = `
        INSERT INTO aircrafts (airline_id, aircraft_type_id, registration_number)
        VALUES ($1, $2, $3)
        RETURNING id, airline_id, aircraft_type_id, registration_number;
      `;
      const values = [
        data.airline_id,       // UUID
        data.aircraft_type_id, // UUID
        data.registration_number
      ];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating aircraft:', error.message);
      throw new Error(`Could not create aircraft: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật thông tin máy bay cụ thể.
   * @param {string} id - UUID máy bay.
   * @param {Object} data - airline_id (UUID), aircraft_type_id (UUID), aircraft_code, status, manufacturer (optional).
   * @returns {Promise<Object>} Máy bay đã cập nhật.
   */
  async updateAircraft(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation
      // TODO: Validate if airline_id and aircraft_type_id exist

      const query = `
        UPDATE aircrafts
        SET airline_id = $1, aircraft_type_id = $2, registration_number = $3
        WHERE id = $4
        RETURNING id, airline_id, aircraft_type_id, registration_number;
      `;
      const values = [
        data.airline_id,       // UUID
        data.aircraft_type_id, // UUID
        data.registration_number,
        id // UUID id
      ];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Aircraft not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error updating aircraft ${id}:`, error.message);
      throw new Error(`Could not update aircraft: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Xoá máy bay cụ thể.
   * Kiểm tra ràng buộc với bảng 'flights'.
   * @param {string} id - UUID máy bay.
   * @returns {Promise<{deleted: true, id: string}>}
   */
  async deleteAircraft(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Check for related flights (active or scheduled flights using this aircraft)
      // The logic from V1 check for *any* flights, might need to refine for V2.
      // Assuming we cannot delete if the aircraft is assigned to any future or currently active flight.
      const flightsRef = await client.query(
        'SELECT 1 FROM flights WHERE aircraft_id = $1 LIMIT 1',
        [id] // UUID id
      );
      if (flightsRef.rows.length > 0) {
        // TODO: Refine this check based on flight status (only prevent deletion if assigned to active/scheduled flights)
        throw new Error('Cannot delete aircraft: Still assigned to flights.');
      }

      const query = `
        DELETE FROM aircrafts
        WHERE id = $1
        RETURNING id;
      `;
      const result = await client.query(query, [id]); // UUID id

      if (result.rows.length === 0) {
        throw new Error('Aircraft not found');
      }

      await client.query('COMMIT');
      return { deleted: true, id: result.rows[0].id };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error deleting aircraft ${id}:`, error.message);
      throw new Error(`Could not delete aircraft: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

// Ensure exporting an instance
module.exports = new AircraftService();
