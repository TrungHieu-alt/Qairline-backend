// services/AirportService.js
const db = require('../config/db');
// Removed: console.log('📊 db trong AirportService:', db);

class AirportService {

  /**
   * Lấy danh sách sân bay với tùy chọn phân trang và lọc.
   * @param {Object} options - Tùy chọn: page, limit, nameKeyword, iataCode, icaoCode, cityId, countryId, ...
   * @returns {Promise<Object>} - { data: [], total: number }
   */
  async getAirports(options = {}) {
    const {
      page = 1,
      limit = 10,
      nameKeyword,      // New filter: keyword in name
      iataCode,         // New filter: exact match for iata_code
      icaoCode,         // New filter: exact match for icao_code
      cityId,           // New filter: by city_id (UUID)
      countryId         // New filter: by country_id (UUID)
    } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, iata_code, icao_code, city_id, country_id, latitude, longitude, timezone, created_at, updated_at
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

     // Filter by iata_code (exact match)
    if (iataCode) {
        query += ` AND iata_code = $${paramIndex}`;
        countQuery += ` AND iata_code = $${paramIndex}`;
        filterValues.push(iataCode);
        countFilterValues.push(iataCode);
        paramIndex++;
    }

     // Filter by icao_code (exact match)
    if (icaoCode) {
        query += ` AND icao_code = $${paramIndex}`;
        countQuery += ` AND icao_code = $${paramIndex}`;
        filterValues.push(icaoCode);
        countFilterValues.push(icaoCode);
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

    // Filter by country_id
    if (countryId) {
        query += ` AND country_id = $${paramIndex}`;
        countQuery += ` AND country_id = $${paramIndex}`;
        filterValues.push(countryId); // UUID
        countFilterValues.push(countryId); // UUID
        paramIndex++;
    }


    // Add other filters here if needed (e.g., by latitude/longitude range, timezone)

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
                SELECT id, name, iata_code, icao_code, city_id, country_id, latitude, longitude, timezone, created_at, updated_at
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
   * @param {Object} data - name, iata_code, icao_code (optional), city_id (UUID), country_id (UUID), latitude (optional), longitude (optional), timezone (optional).
   * @returns {Promise<Object>} Sân bay đã tạo.
   */
  async createAirport(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation (e.g., name, iata_code, city_id, country_id are required)
      // TODO: Validate if city_id and country_id exist in their respective tables
      // TODO: Validate uniqueness of iata_code and icao_code

      const query = `
        INSERT INTO airports (name, iata_code, icao_code, city_id, country_id, latitude, longitude, timezone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, iata_code, icao_code, city_id, country_id, latitude, longitude, timezone, created_at, updated_at;
      `;
      const values = [
        data.name,
        data.iata_code,
        data.icao_code,
        data.city_id,   // UUID
        data.country_id,// UUID
        data.latitude,
        data.longitude,
        data.timezone
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
   * @param {Object} data - name, iata_code, icao_code (optional), city_id (UUID), country_id (UUID), latitude (optional), longitude (optional), timezone (optional).
   * @returns {Promise<Object>} Sân bay đã cập nhật.
   */
  async updateAirport(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation
      // TODO: Validate if city_id and country_id exist
      // TODO: Validate uniqueness of iata_code and icao_code if they are being updated

      const query = `
        UPDATE airports
        SET name = $1, iata_code = $2, icao_code = $3, city_id = $4, country_id = $5, latitude = $6, longitude = $7, timezone = $8, updated_at = NOW()
        WHERE id = $9
        RETURNING id, name, iata_code, icao_code, city_id, country_id, latitude, longitude, timezone, created_at, updated_at;
      `;
      const values = [
        data.name,
        data.iata_code,
        data.icao_code,
        data.city_id,   // UUID
        data.country_id,// UUID
        data.latitude,
        data.longitude,
        data.timezone,
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

      // Check for related routes
      const routesRef = await client.query(
        'SELECT 1 FROM routes WHERE origin_airport_id = $1 OR destination_airport_id = $1 LIMIT 1',
        [id] // UUID id
      );
      if (routesRef.rows.length > 0) {
        throw new Error('Cannot delete airport: Still used in routes.');
      }

      // Check for related flights
      const flightsRef = await client.query(
        'SELECT 1 FROM flights WHERE origin_airport_id = $1 OR destination_airport_id = $1 LIMIT 1',
        [id] // UUID id
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
