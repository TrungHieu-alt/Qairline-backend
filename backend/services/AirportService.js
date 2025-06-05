// services/AirportService.js
const db = require('../config/db');
// Removed: console.log('📊 db trong AirportService:', db);

class AirportService {

  /**
   * Lấy danh sách sân bay với tùy chọn phân trang và lọc.
  * @param {Object} options - Tùy chọn: page, limit, nameKeyword, code, cityId
   * @returns {Promise<Object>} - { data: [], total: number }
   */
  async getAirports(options = {}) {
    const {
      page = 1,
      limit = 10,
      nameKeyword,      // Filter: keyword in name
      code,             // Filter: exact match for code
      cityId            // Filter: by city_id (UUID)
    } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, code, city_id
      FROM airports
      WHERE 1=1 -- Start with a true condition to easily append others
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM airports
      WHERE 1=1
    `;

    const filterValues = [];
    const countFilterValues = [];
    let paramIndex = 1;

    // Filter by name keyword (case-insensitive)
    if (nameKeyword) {
        query += ` AND name ILIKE $${paramIndex}`;
        countQuery += ` AND name ILIKE $${paramIndex}`;
        filterValues.push(`%${nameKeyword}%`);
        countFilterValues.push(`%${nameKeyword}%`);
        paramIndex++;
    }

    // Filter by code (exact match)
    if (code) {
        query += ` AND code = $${paramIndex}`;
        countQuery += ` AND code = $${paramIndex}`;
        filterValues.push(code);
        countFilterValues.push(code);
        paramIndex++;
    }


    // Filter by city_id
    if (cityId) {
        query += ` AND city_id = $${paramIndex}`;
        countQuery += ` AND city_id = $${paramIndex}`;
        filterValues.push(cityId); // UUID
        countFilterValues.push(cityId); // UUID
        paramIndex++;
    }


    // Add other filters here if needed

    query += `
      ORDER BY name ASC -- Default order
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
      console.error('❌ Error fetching airports:', error.message);
      throw new Error(`Could not fetch airports: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết sân bay theo ID.
   * @param {string} id - UUID sân bay.
   * @returns {Promise<Object|null>}
   */
   async getAirportById(id) {
       try {
           const query = `
                SELECT id, name, code, city_id
                FROM airports
                WHERE id = $1;
           `;
           const result = await db.query(query, [id]); // UUID id
           if (result.rows.length === 0) {
               return null; // Airport not found
           }
           return result.rows[0];
       } catch (error) {
           console.error(`❌ Error fetching airport by ID ${id}:`, error.message);
           throw new Error(`Could not fetch airport by ID: ${error.message}`);
       }
   }

  /**
   * Tạo sân bay mới.
  * @param {Object} data - name, code, city_id (UUID).
   * @returns {Promise<Object>} Sân bay đã tạo.
   */
  async createAirport(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation (e.g., name and code are required)
      // TODO: Validate if city_id exists
      // TODO: Validate uniqueness of code

      const query = `
        INSERT INTO airports (name, code, city_id)
        VALUES ($1, $2, $3)
        RETURNING id, name, code, city_id;
      `;
      const values = [
        data.name,
        data.code,
        data.city_id   // UUID
      ];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating airport:', error.message);
      throw new Error(`Could not create airport: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật thông tin sân bay.
   * @param {string} id - UUID sân bay.
   * @param {Object} data - name, code, city_id (UUID).
   * @returns {Promise<Object>} Sân bay đã cập nhật.
   */
  async updateAirport(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation
      // TODO: Validate if city_id exists
      // TODO: Validate uniqueness of code if it is being updated

      const query = `
        UPDATE airports
        SET name = $1, code = $2, city_id = $3
        WHERE id = $4
        RETURNING id, name, code, city_id;
      `;
      const values = [
        data.name,
        data.code,
        data.city_id,   // UUID
        id // UUID id
      ];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Airport not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error updating airport ${id}:`, error.message);
      throw new Error(`Could not update airport: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Xoá sân bay.
   * Kiểm tra ràng buộc với bảng 'routes' và 'flights'.
   * @param {string} id - UUID sân bay.
   * @returns {Promise<{deleted: true, id: string}>}
   */
  async deleteAirport(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Check for related flights
      const flightsRef = await client.query(
        'SELECT 1 FROM flights WHERE source_airport_id = $1 OR destination_airport_id = $1 LIMIT 1',
        [id]
      );
      if (flightsRef.rows.length > 0) {
        // TODO: Refine this check based on flight status (only prevent deletion if assigned to active/scheduled flights)
        throw new Error('Cannot delete airport: Still used in flights.');
      }


      const query = `
        DELETE FROM airports
        WHERE id = $1
        RETURNING id;
      `;
      const result = await client.query(query, [id]); // UUID id

      if (result.rows.length === 0) {
        throw new Error('Airport not found');
      }

      await client.query('COMMIT');
      return { deleted: true, id: result.rows[0].id };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error deleting airport ${id}:`, error.message);
      throw new Error(`Could not delete airport: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

// Ensure exporting an instance
module.exports = new AirportService();
