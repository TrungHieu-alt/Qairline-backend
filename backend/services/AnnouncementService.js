const Announcement = require('../models/Announcement');
const db = require('../config/db');

class AnnouncementService {
  async getAll() {
    const result = await db.query('SELECT * FROM announcements WHERE expiry_date > NOW() ORDER BY published_date DESC');
    return result.rows.map(row => new Announcement(row));
  }

  async create(data) {
    const query = `
      INSERT INTO announcements (title, content, type, published_date, expiry_date, created_by)
      VALUES ($1,$2,$3,NOW(),$4,$5) RETURNING *;
    `;
    const values = [data.title, data.content, data.type, data.expiry_date, data.created_by];
    const result = await db.query(query, values);
    return new Announcement(result.rows[0]);
  }

  async update(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE announcements 
        SET title = $1, content = $2, type = $3, expiry_date = $4, created_by = $5
        WHERE id = $6
        RETURNING *;
      `;
      const values = [
        data.title,
        data.content,
        data.type,
        data.expiry_date,
        data.created_by,
        id
      ];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Announcement not found');
      }

      await client.query('COMMIT');
      return new Announcement(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const query = `
        DELETE FROM announcements 
        WHERE id = $1
        RETURNING *;
      `;
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Announcement not found');
      }

      await client.query('COMMIT');
      return new Announcement(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = AnnouncementService;