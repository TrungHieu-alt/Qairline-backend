const db = require('../config/db');
// Removed: const Announcement = require('../models/Announcement');

class AnnouncementService {

  /**
   * Lấy danh sách thông báo còn hiệu lực với tùy chọn phân trang, tìm kiếm và lọc.
   * @param {Object} options - Tùy chọn: page, limit, status, type, titleKeyword, startDate, endDate, ...
   * @returns {Promise<Object>} - { data: [], total: number }
   */
  async getAnnouncements(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        type,
        titleKeyword,
        startDate,
        endDate
      } = options;
      const offset = (page - 1) * limit;

      console.log('📝 Options received:', options);

      const baseQuery = `
        SELECT id, title, content, type, status, start_date, end_date, priority, created_at, updated_at
        FROM announcements
        WHERE (end_date IS NULL OR end_date > NOW())
      `;

      const baseCountQuery = `
        SELECT COUNT(*)
        FROM announcements
        WHERE (end_date IS NULL OR end_date > NOW())
      `;

      const filterValues = [];
      const countFilterValues = [];
      const conditions = [];
      let paramIndex = 1;

      if (status) {
          conditions.push(`status = $${paramIndex}`);
          filterValues.push(status);
          countFilterValues.push(status);
          paramIndex++;
      }

      if (type) {
          conditions.push(`type = $${paramIndex}`);
          filterValues.push(type);
          countFilterValues.push(type);
          paramIndex++;
      }

      if (titleKeyword) {
          conditions.push(`title ILIKE $${paramIndex}`);
          filterValues.push(`%${titleKeyword}%`);
          countFilterValues.push(`%${titleKeyword}%`);
          paramIndex++;
      }

      if (startDate) {
          conditions.push(`start_date >= $${paramIndex}`);
          filterValues.push(startDate);
          countFilterValues.push(startDate);
          paramIndex++;
      }

      if (endDate) {
          conditions.push(`start_date <= $${paramIndex}`);
          filterValues.push(endDate);
          countFilterValues.push(endDate);
          paramIndex++;
      }

      const filterClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';
      
      const finalQuery = `${baseQuery}${filterClause} ORDER BY start_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      const finalCountQuery = `${baseCountQuery}${filterClause}`;

      filterValues.push(limit);
      filterValues.push(offset);

      console.log('🔍 Final Query:', finalQuery);
      console.log('🔢 Filter Values:', filterValues);

      const result = await db.query(finalQuery, filterValues);
      const countResult = await db.query(finalCountQuery, countFilterValues);

      console.log('✅ Query results:', {
        data: result.rows,
        total: parseInt(countResult.rows[0].count, 10)
      });

      return {
          data: result.rows,
          total: parseInt(countResult.rows[0].count, 10)
      };

    } catch (error) {
      console.error('❌ Error in getAnnouncements:', error);
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
                SELECT id, title, content, type, status, start_date, end_date, priority, created_at, updated_at
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
   * @param {Object} data - title, content, type, status, start_date, end_date, priority.
   * @returns {Promise<Object>} Thông báo đã tạo.
   */
  async create(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO announcements (title, content, type, status, start_date, end_date, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, title, content, type, status, start_date, end_date, priority, created_at, updated_at;
      `;
      const values = [
        data.title,
        data.content,
        data.type || 'general',
        data.status || 'active',
        data.start_date || new Date(),
        data.end_date,
        data.priority || 0
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
   * @param {Object} data - title, content, type, status, start_date, end_date, priority.
   * @returns {Promise<Object>} Thông báo đã cập nhật.
   */
  async update(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE announcements
        SET title = $1, content = $2, type = $3, status = $4, start_date = $5, end_date = $6, priority = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING id, title, content, type, status, start_date, end_date, priority, created_at, updated_at;
      `;
      const values = [
        data.title,
        data.content,
        data.type,
        data.status,
        data.start_date,
        data.end_date,
        data.priority,
        id
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
        RETURNING id, title, content, type, status, start_date, end_date, priority, created_at, updated_at;
      `;
      const result = await client.query(query, [id]);

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
