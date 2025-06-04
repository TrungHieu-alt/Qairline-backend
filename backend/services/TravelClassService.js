const db = require('../config/db');

class TravelClassService {

  /**
   * Lấy danh sách hạng ghế với tùy chọn phân trang và lọc.
   * @param {Object} options - Tùy chọn: page, limit, nameKeyword, ...
   * @returns {Promise<Object>} - { data: [], total: number }
   */
  async getTravelClasses(options = {}) {
    const {
      page = 1,
      limit = 10,
      nameKeyword,      // New filter: keyword in name
    } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, created_at, updated_at
      FROM travel_classes
      WHERE 1=1 -- Start with a true condition to easily append others
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM travel_classes
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
      console.error('❌ Error fetching travel classes:', error.message);
      throw new Error(`Could not fetch travel classes: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết hạng ghế theo ID.
   * @param {string} id - UUID hạng ghế.
   * @returns {Promise<Object|null>}
   */
   async getTravelClassById(id) {
       try {
           const query = `
                SELECT id, name, created_at, updated_at
                FROM travel_classes
                WHERE id = $1;
           `;
           const result = await db.query(query, [id]); // UUID id
           if (result.rows.length === 0) {
               return null; // Travel class not found
           }
           return result.rows[0];
       } catch (error) {
           console.error(`❌ Error fetching travel class by ID ${id}:`, error.message);
           throw new Error(`Could not fetch travel class by ID: ${error.message}`);
       }
   }

  /**
   * Tạo hạng ghế mới.
   * @param {Object} data - name.
   * @returns {Promise<Object>} Hạng ghế đã tạo.
   */
  async createTravelClass(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation (e.g., name is required)
      // TODO: Validate uniqueness of name

      const query = `
        INSERT INTO travel_classes (name)
        VALUES ($1)
        RETURNING id, name, created_at, updated_at;
      `;
      const values = [
        data.name,
      ];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating travel class:', error.message);
      throw new Error(`Could not create travel class: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật thông tin hạng ghế.
   * @param {string} id - UUID hạng ghế.
   * @param {Object} data - name (optional).
   * @returns {Promise<Object>} Hạng ghế đã cập nhật.
   */
  async updateTravelClass(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation
      // TODO: Validate uniqueness of name if it is being updated

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
          updateFields.push(`name = $${paramIndex}`);
          values.push(data.name);
          paramIndex++;
      }

      if (updateFields.length === 0) {
          // No fields to update
           await client.query('ROLLBACK'); // No changes, rollback the BEGIN
           const existing = await this.getTravelClassById(id); // Fetch current data
           if (!existing) {
               throw new Error('Travel class not found');
           }
           return existing; // Return existing data if no updates were requested
      }

      updateFields.push(`updated_at = NOW()`);

      values.push(id); // UUID id for WHERE clause
      const query = `
        UPDATE travel_classes
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, created_at, updated_at;
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Travel class not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error updating travel class ${id}:`, error.message);
      throw new Error(`Could not update travel class: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Xoá hạng ghế.
   * Kiểm tra ràng buộc với bảng 'service_offerings' và có thể các bảng khác (ví dụ: 'flights', 'seat_details').
   * @param {string} id - UUID hạng ghế.
   * @returns {Promise<{deleted: true, id: string}>}
   */
  async deleteTravelClass(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Check for related service_offerings
      const serviceOfferingsRef = await client.query(
        'SELECT 1 FROM service_offerings WHERE travel_class_id = $1 LIMIT 1',
        [id] // UUID id
      );
      if (serviceOfferingsRef.rows.length > 0) {
        throw new Error('Cannot delete travel class: Still has service offerings linked.');
      }

       // TODO: Check for related flights or seat_details if they have a direct link
       // const flightsRef = await client.query(
       //   'SELECT 1 FROM flights WHERE travel_class_id = $1 LIMIT 1',
       //   [id] // UUID id
       // );
       // if (flightsRef.rows.length > 0) {
       //   throw new Error('Cannot delete travel class: Still linked to flights.');
       // }
        // const seatDetailsRef = await client.query(
       //   'SELECT 1 FROM seat_details WHERE travel_class_id = $1 LIMIT 1', // Or similar table name
       //   [id] // UUID id
       // );
       // if (seatDetailsRef.rows.length > 0) {
       //   throw new Error('Cannot delete travel class: Still linked to seat details.');
       // }


      const query = `
        DELETE FROM travel_classes
        WHERE id = $1
        RETURNING id;
      `;
      const result = await client.query(query, [id]); // UUID id

      if (result.rows.length === 0) {
        throw new Error('Travel class not found');
      }

      await client.query('COMMIT');
      return { deleted: true, id: result.rows[0].id };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error deleting travel class ${id}:`, error.message);
      throw new Error(`Could not delete travel class: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

// Ensure exporting an instance
module.exports = new TravelClassService();