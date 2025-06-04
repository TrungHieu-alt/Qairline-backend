const db = require('../config/db');

class AircraftTypeService {

  /**
   * Lấy danh sách loại máy bay với tùy chọn phân trang và lọc.
   * @param {Object} options - Tùy chọn: page, limit, nameKeyword, manufacturerKeyword, ...
   * @returns {Promise<Object>} - { data: [], total: number }
   */
  async getAircraftTypes(options = {}) {
    const {
      page = 1,
      limit = 10,
      nameKeyword,
      manufacturerKeyword
    } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, manufacturer, total_seats, created_at, updated_at
      FROM aircraft_types
      WHERE 1=1 -- Start with a true condition to easily append others
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM aircraft_types
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

    // Filter by manufacturer keyword (case-insensitive)
    if (manufacturerKeyword) {
        query += ` AND manufacturer ILIKE $${paramIndex}`;
        countQuery += ` AND manufacturer ILIKE $${paramIndex}`;
        filterValues.push(`%${manufacturerKeyword}%`);
        countFilterValues.push(`%${manufacturerKeyword}%`);
        paramIndex++;
    }

    // Add other filters here if needed (e.g., total_seats range)

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
      console.error('❌ Error fetching aircraft types:', error.message);
      throw new Error(`Could not fetch aircraft types: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết loại máy bay theo ID.
   * @param {string} id - UUID loại máy bay.
   * @returns {Promise<Object|null>}
   */
   async getAircraftTypeById(id) {
       try {
           const query = `
                SELECT id, name, manufacturer, total_seats, created_at, updated_at
                FROM aircraft_types
                WHERE id = $1;
           `;
           const result = await db.query(query, [id]); // UUID id
           if (result.rows.length === 0) {
               return null; // Aircraft type not found
           }
           return result.rows[0];
       } catch (error) {
           console.error(`❌ Error fetching aircraft type by ID ${id}:`, error.message);
           throw new Error(`Could not fetch aircraft type by ID: ${error.message}`);
       }
   }

  /**
   * Tạo loại máy bay mới.
   * @param {Object} data - name, manufacturer, total_seats.
   * @returns {Promise<Object>} Loại máy bay đã tạo.
   */
  async createAircraftType(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation (e.g., name and total_seats are required, total_seats is a positive integer)

      const query = `
        INSERT INTO aircraft_types (name, manufacturer, total_seats)
        VALUES ($1, $2, $3)
        RETURNING id, name, manufacturer, total_seats, created_at, updated_at;
      `;
      const values = [
        data.name,
        data.manufacturer,
        data.total_seats
      ];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating aircraft type:', error.message);
      throw new Error(`Could not create aircraft type: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật loại máy bay.
   * @param {string} id - UUID loại máy bay.
   * @param {Object} data - name, manufacturer, total_seats.
   * @returns {Promise<Object>} Loại máy bay đã cập nhật.
   */
  async updateAircraftType(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation

      const query = `
        UPDATE aircraft_types
        SET name = $1, manufacturer = $2, total_seats = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING id, name, manufacturer, total_seats, created_at, updated_at;
      `;
      const values = [
        data.name,
        data.manufacturer,
        data.total_seats,
        id // UUID id
      ];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Aircraft type not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error updating aircraft type ${id}:`, error.message);
      throw new Error(`Could not update aircraft type: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Xoá loại máy bay.
   * Kiểm tra ràng buộc với bảng 'aircrafts' và 'aircraft_seat_layout'.
   * @param {string} id - UUID loại máy bay.
   * @returns {Promise<{deleted: true, id: string}>}
   */
  async deleteAircraftType(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Check for related aircrafts
      const aircraftsRef = await client.query(
        'SELECT 1 FROM aircrafts WHERE aircraft_type_id = $1 LIMIT 1',
        [id] // UUID id
      );
      if (aircraftsRef.rows.length > 0) {
        throw new Error('Cannot delete aircraft type: Still has specific aircrafts linked.');
      }

      // Check for related seat layouts
      const seatLayoutRef = await client.query(
        'SELECT 1 FROM aircraft_seat_layout WHERE aircraft_type_id = $1 LIMIT 1',
        [id] // UUID id
      );
      if (seatLayoutRef.rows.length > 0) {
           throw new Error('Cannot delete aircraft type: Still has seat layouts linked.');
      }

       // TODO: Re-evaluate if seat_details in V2 links directly to aircraft_type_id based on full schema.
       // If yes, add a check here:
       // const seatDetailsRef = await client.query('SELECT 1 FROM seat_details WHERE aircraft_type_id = $1 LIMIT 1', [id]);
       // if (seatDetailsRef.rows.length > 0) { throw new Error('Cannot delete aircraft type: Still has seat details linked.'); }


      const query = `
        DELETE FROM aircraft_types
        WHERE id = $1
        RETURNING id;
      `;
      const result = await client.query(query, [id]); // UUID id

      if (result.rows.length === 0) {
        throw new Error('Aircraft type not found');
      }

      await client.query('COMMIT');
      return { deleted: true, id: result.rows[0].id };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error deleting aircraft type ${id}:`, error.message);
      throw new Error(`Could not delete aircraft type: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

// Ensure exporting an instance
module.exports = new AircraftTypeService();
