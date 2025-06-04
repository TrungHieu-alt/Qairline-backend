const db = require('../config/db');
// Removed: const Announcement = require('../models/Announcement');

class AnnouncementService {

  /**
   * Lấy danh sách thông báo còn hiệu lực với tùy chọn phân trang, tìm kiếm và lọc.
   * @param {Object} options - Tùy chọn: page, limit, flightId, type, titleKeyword, startDate, endDate, ...
   * @returns {Promise<Object>} - { data: [], total: number }
   */
  async getAnnouncements(options = {}) {
    const {
      page = 1,
      limit = 10,
      flightId,
      type,
      titleKeyword, // New filter: keyword in title
      startDate,    // New filter: published_date >= startDate
      endDate       // New filter: published_date <= endDate (or expiry_date?)
    } = options; // Default pagination
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, title, content, type, published_date, expiry_date, created_by, flight_id, created_at, updated_at
      FROM announcements
      WHERE expiry_date > NOW()
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM announcements
      WHERE expiry_date > NOW()
    `;

    const filterValues = [];
    const countFilterValues = [];
    let filterConditions = '';
    let paramIndex = 1;

    if (flightId) {
        filterConditions += ` AND flight_id = $${paramIndex}`;
        filterValues.push(flightId);
        countFilterValues.push(flightId);
        paramIndex++;
    }

    if (type) {
        filterConditions += ` AND type = $${paramIndex}`;
        filterValues.push(type);
        countFilterValues.push(type);
        paramIndex++;
    }

    // New filter: search by keyword in title (case-insensitive)
    if (titleKeyword) {
        filterConditions += ` AND title ILIKE $${paramIndex}`; // ILIKE for case-insensitive
        filterValues.push(`%${titleKeyword}%`); // Use % for partial matching
        countFilterValues.push(`%${titleKeyword}%`);
        paramIndex++;
    }

    // New filter: filter by published_date range
    if (startDate) {
        filterConditions += ` AND published_date >= $${paramIndex}`;
        // Ensure startDate is a valid date object or string parseable by the DB driver
        filterValues.push(startDate);
        countFilterValues.push(startDate);
        paramIndex++;
    }

    if (endDate) {
        // Decide whether to filter by published_date or expiry_date range
        // For "lọc theo ngày", maybe filter by published_date or expiry_date?
        // Let's assume filtering by published_date range for now.
        filterConditions += ` AND published_date <= $${paramIndex}`;
         // Ensure endDate is a valid date object or string parseable by the DB driver
        filterValues.push(endDate);
        countFilterValues.push(endDate);
        paramIndex++;
    }
    // TODO: Consider filtering by expiry_date range as well if needed.


    query += filterConditions;
    countQuery += filterConditions;

    query += `
      ORDER BY published_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    filterValues.push(limit);
    filterValues.push(offset);


    try {
      const result = await db.query(query, filterValues);
      const countResult = await db.query(countQuery, countFilterValues); // Separate query for total count

      // No longer mapping to Announcement model
      return {
          data: result.rows,
          total: parseInt(countResult.rows[0].count, 10) // Return total for pagination
      };

    } catch (error) {
      console.error('❌ Error fetching announcements:', error.message);
      throw new Error(`Could not fetch announcements: ${error.message}`);
    }
  }


  /**
   * Lấy thông báo theo ID.
   * @param {string} id - UUID thông báo.
   * @returns {Promise<Object|null>}
   */
   async getById(id) {
       try {
           const query = `
                SELECT id, title, content, type, published_date, expiry_date, created_by, flight_id, created_at, updated_at
                FROM announcements
                WHERE id = $1;
           `;
           const result = await db.query(query, [id]);
           if (result.rows.length === 0) {
               return null; // Announcement not found
           }
           // No longer mapping to Announcement model
           return result.rows[0];
       } catch (error) {
           console.error(`❌ Error fetching announcement by ID ${id}:`, error.message);
           throw new Error(`Could not fetch announcement by ID: ${error.message}`);
       }
   }


  /**
   * Tạo thông báo mới.
   * @param {Object} data - title, content, type, expiry_date, created_by, optional flight_id.
   * @returns {Promise<Object>} Thông báo đã tạo.
   */
  async create(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO announcements (title, content, type, published_date, expiry_date, created_by, flight_id)
        VALUES ($1, $2, $3, NOW(), $4, $5, $6)
        RETURNING id, title, content, type, published_date, expiry_date, created_by, flight_id, created_at, updated_at;
      `;
      const values = [
        data.title,
        data.content,
        data.type,
        data.expiry_date,
        data.created_by, // Assuming created_by is passed as UUID
        data.flight_id // Optional flight_id
      ];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      // No longer mapping to Announcement model
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating announcement:', error.message);
      throw new Error(`Could not create announcement: ${error.message}`);
    } finally {
      client.release();
    }
  }


  /**
   * Cập nhật thông báo.
   * @param {string} id - UUID thông báo.
   * @param {Object} data - title, content, type, expiry_date, created_by, optional flight_id.
   * @returns {Promise<Object>} Thông báo đã cập nhật.
   */
  async update(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE announcements
        SET title = $1, content = $2, type = $3, expiry_date = $4, created_by = $5, flight_id = $6, updated_at = NOW()
        WHERE id = $7
        RETURNING id, title, content, type, published_date, expiry_date, created_by, flight_id, created_at, updated_at;
      `;
      const values = [
        data.title,
        data.content,
        data.type,
        data.expiry_date,
        data.created_by, // Assuming created_by is passed as UUID
        data.flight_id, // Optional flight_id
        id // UUID id
      ];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Announcement not found');
      }

      await client.query('COMMIT');
      // No longer mapping to Announcement model
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error updating announcement ${id}:`, error.message);
      throw new Error(`Could not update announcement: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Xoá thông báo.
   * @param {string} id - UUID thông báo.
   * @returns {Promise<Object>} Thông báo đã xoá.
   */
  async delete(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const query = `
        DELETE FROM announcements
        WHERE id = $1
        RETURNING id, title, content, type, published_date, expiry_date, created_by, flight_id, created_at, updated_at;
      `;
      const result = await client.query(query, [id]); // UUID id

      if (result.rows.length === 0) {
        throw new Error('Announcement not found');
      }

      await client.query('COMMIT');
      // No longer mapping to Announcement model
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error deleting announcement ${id}:`, error.message);
      throw new Error(`Could not delete announcement: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // TODO: Add method to get announcements for a specific user (considering read status if implemented)
  // TODO: Add method to mark announcement as read for a user (if read status is implemented)

}

// Ensure exporting an instance
module.exports = new AnnouncementService();
