const db = require('../config/db');

class CountryService {

  /**
   * Lấy danh sách quốc gia với tùy chọn phân trang và lọc.
   * @param {Object} options - Tùy chọn: page, limit, nameKeyword, isoCode, ...
   * @returns {Promise<Object>} - { data: [], total: number }
   */
  async getCountries(options = {}) {
    const {
      page = 1,
      limit = 10,
      nameKeyword,      // New filter: keyword in name
      isoCode           // New filter: exact match for iso_code
    } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, iso_code, created_at, updated_at
      FROM countries
      WHERE 1=1 -- Start with a true condition to easily append others
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM countries
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

     // Filter by iso_code (case-insensitive)
    if (isoCode) {
        query += ` AND iso_code ILIKE $${paramIndex}`;
        countQuery += ` AND iso_code ILIKE $${paramIndex}`;
        filterValues.push(isoCode.toUpperCase()); // Store and filter as uppercase
        countFilterValues.push(isoCode.toUpperCase()); // Store and filter as uppercase
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
      console.error('❌ Error fetching countries:', error.message);
      throw new Error(`Could not fetch countries: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết quốc gia theo ID.
   * @param {string} id - UUID quốc gia.
   * @returns {Promise<Object|null>}
   */
   async getCountryById(id) {
       try {
           const query = `
                SELECT id, name, iso_code, created_at, updated_at
                FROM countries
                WHERE id = $1;
           `;
           const result = await db.query(query, [id]); // UUID id
           if (result.rows.length === 0) {
               return null; // Country not found
           }
           return result.rows[0];
       } catch (error) {
           console.error(`❌ Error fetching country by ID ${id}:`, error.message);
           throw new Error(`Could not fetch country by ID: ${error.message}`);
       }
   }

  /**
   * Tạo quốc gia mới.
   * @param {Object} data - name, iso_code.
   * @returns {Promise<Object>} Quốc gia đã tạo.
   */
  async createCountry(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation (e.g., name, iso_code are required)
      // TODO: Validate uniqueness of iso_code

      const query = `
        INSERT INTO countries (name, iso_code)
        VALUES ($1, $2)
        RETURNING id, name, iso_code, created_at, updated_at;
      `;
      const values = [
        data.name,
        data.iso_code ? data.iso_code.toUpperCase() : null // Store as uppercase
      ];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating country:', error.message);
      throw new Error(`Could not create country: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật thông tin quốc gia.
   * @param {string} id - UUID quốc gia.
   * @param {Object} data - name (optional), iso_code (optional).
   * @returns {Promise<Object>} Quốc gia đã cập nhật.
   */
  async updateCountry(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation
      // TODO: Validate uniqueness of iso_code if it is being updated

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
          updateFields.push(`name = $${paramIndex}`);
          values.push(data.name);
          paramIndex++;
      }
      if (data.iso_code !== undefined) {
          updateFields.push(`iso_code = $${paramIndex}`);
          values.push(data.iso_code ? data.iso_code.toUpperCase() : null); // Store as uppercase
          paramIndex++;
      }

      if (updateFields.length === 0) {
          // No fields to update
           await client.query('ROLLBACK'); // No changes, rollback the BEGIN
           const existing = await this.getCountryById(id); // Fetch current data
           if (!existing) {
               throw new Error('Country not found');
           }
           return existing; // Return existing data if no updates were requested
      }

      updateFields.push(`updated_at = NOW()`);

      values.push(id); // UUID id for WHERE clause
      const query = `
        UPDATE countries
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, iso_code, created_at, updated_at;
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Country not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error updating country ${id}:`, error.message);
      throw new Error(`Could not update country: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Xoá quốc gia.
   * Kiểm tra ràng buộc với bảng 'cities' và 'airports'.
   * @param {string} id - UUID quốc gia.
   * @returns {Promise<{deleted: true, id: string}>}
   */
  async deleteCountry(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Check for related cities
      const citiesRef = await client.query(
        'SELECT 1 FROM cities WHERE country_id = $1 LIMIT 1',
        [id] // UUID id
      );
      if (citiesRef.rows.length > 0) {
        throw new Error('Cannot delete country: Still has cities linked.');
      }

      // Check for related airports
      const airportsRef = await client.query(
        'SELECT 1 FROM airports WHERE country_id = $1 LIMIT 1',
        [id] // UUID id
      );
      if (airportsRef.rows.length > 0) {
        throw new Error('Cannot delete country: Still has airports linked.');
      }


      const query = `
        DELETE FROM countries
        WHERE id = $1
        RETURNING id;
      `;
      const result = await client.query(query, [id]); // UUID id

      if (result.rows.length === 0) {
        throw new Error('Country not found');
      }

      await client.query('COMMIT');
      return { deleted: true, id: result.rows[0].id };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error deleting country ${id}:`, error.message);
      throw new Error(`Could not delete country: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

// Ensure exporting an instance
module.exports = new CountryService();