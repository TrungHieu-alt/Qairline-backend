const db = require('../config/db');
// Removed: const Airline = require('../models/Airline');

class AirlineService {

  /**
   * Lấy danh sách hãng hàng không với tùy chọn phân trang và lọc.
  * @param {Object} options - Tùy chọn: page, limit, nameKeyword, code, ...
   * @returns {Promise<Object>} - { data: [], total: number }
   */
  async getAirlines(options = {}) {
    const {
      page = 1,
      limit = 10,
      nameKeyword,   // New filter: keyword in name
      code           // New filter: exact match for code
    } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, code
      FROM airlines
      WHERE 1=1 -- Start with a true condition to easily append others
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM airlines
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
      console.error('❌ Error fetching airlines:', error.message);
      throw new Error(`Could not fetch airlines: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết hãng hàng không theo ID.
   * @param {string} id - UUID hãng hàng không.
   * @returns {Promise<Object|null>}
   */
   async getAirlineById(id) {
       try {
           const query = `
                SELECT id, name, code
                FROM airlines
                WHERE id = $1;
           `;
           const result = await db.query(query, [id]); // UUID id
           if (result.rows.length === 0) {
               return null; // Airline not found
           }
           return result.rows[0];
       } catch (error) {
           console.error(`❌ Error fetching airline by ID ${id}:`, error.message);
           throw new Error(`Could not fetch airline by ID: ${error.message}`);
       }
   }

  /**
   * Tạo hãng hàng không mới.
   * @param {Object} data - name, code.
   * @returns {Promise<Object>} Hãng hàng không đã tạo.
   */
  async createAirline(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation (e.g., name is required)
      // TODO: Validate uniqueness of code if provided

      const query = `
        INSERT INTO airlines (name, code)
        VALUES ($1, $2)
        RETURNING id, name, code;
      `;
      const values = [
        data.name,
        data.code
      ];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating airline:', error.message);
      throw new Error(`Could not create airline: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật thông tin hãng hàng không.
   * @param {string} id - UUID hãng hàng không.
   * @param {Object} data - name, code.
   * @returns {Promise<Object>} Hãng hàng không đã cập nhật.
   */
  async updateAirline(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation
      // TODO: Validate uniqueness of code if it is being updated

      const query = `
        UPDATE airlines
        SET name = $1, code = $2
        WHERE id = $3
        RETURNING id, name, code;
      `;
      const values = [
        data.name,
        data.code,
        id // UUID id
      ];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Airline not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error updating airline ${id}:`, error.message);
      throw new Error(`Could not update airline: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Xoá hãng hàng không.
   * Kiểm tra ràng buộc với bảng 'aircrafts' và 'flights'.
   * @param {string} id - UUID hãng hàng không.
   * @returns {Promise<{deleted: true, id: string}>}
   */
  async deleteAirline(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Check for related aircrafts
      const aircraftsRef = await client.query(
        'SELECT 1 FROM aircrafts WHERE airline_id = $1 LIMIT 1',
        [id] // UUID id
      );
      if (aircraftsRef.rows.length > 0) {
        throw new Error('Cannot delete airline: Still has aircrafts linked.');
      }

      // Check for flights via aircrafts
      const flightsRef = await client.query(
        `SELECT 1 FROM flights f
         JOIN aircrafts ac ON f.aircraft_id = ac.id
         WHERE ac.airline_id = $1 LIMIT 1`,
        [id]
      );
      if (flightsRef.rows.length > 0) {
        throw new Error('Cannot delete airline: Still has flights linked.');
      }


      const query = `
        DELETE FROM airlines
        WHERE id = $1
        RETURNING id;
      `;
      const result = await client.query(query, [id]); // UUID id

      if (result.rows.length === 0) {
        throw new Error('Airline not found');
      }

      await client.query('COMMIT');
      return { deleted: true, id: result.rows[0].id };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error deleting airline ${id}:`, error.message);
      throw new Error(`Could not delete airline: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

// Ensure exporting an instance
module.exports = new AirlineService();
