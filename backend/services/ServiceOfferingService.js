const db = require('../config/db');

class ServiceOfferingService {

  /**
   * Lấy danh sách dịch vụ cung cấp với tùy chọn phân trang và lọc.
   * @param {Object} options - Tùy chọn: page, limit, travelClassId, serviceId, isOffered, fromMonth, toMonth, ...
   * @returns {Promise<Object>} - { data: [], total: number }
   */
  async getServiceOfferings(options = {}) {
    const {
      page = 1,
      limit = 10,
      travelClassId, // New filter: by travel_class_id (UUID)
      serviceId,     // New filter: by service_id (UUID)
      isOffered,     // New filter: by is_offered (boolean)
      fromMonth,     // New filter: by from_month
      toMonth        // New filter: by to_month
    } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT travel_class_id, service_id, is_offered, from_month, to_month, created_at, updated_at
      FROM service_offerings
      WHERE 1=1 -- Start with a true condition to easily append others
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM service_offerings
      WHERE 1=1
    `;

    const filterValues = [];
    const countFilterValues = [];
    let paramIndex = 1;

    // Filter by travel_class_id
    if (travelClassId) {
        query += ` AND travel_class_id = $${paramIndex}`;
        countQuery += ` AND travel_class_id = $${paramIndex}`;
        filterValues.push(travelClassId); // UUID
        countFilterValues.push(travelClassId); // UUID
        paramIndex++;
    }

    // Filter by service_id
    if (serviceId) {
        query += ` AND service_id = $${paramIndex}`;
        countQuery += ` AND service_id = $${paramIndex}`;
        filterValues.push(serviceId); // UUID
        countFilterValues.push(serviceId); // UUID
        paramIndex++;
    }

    // Filter by is_offered
    // Note: In SQL, boolean can be true/false or 1/0 depending on DB type.
    // Assuming boolean or compatible type.
    if (isOffered !== undefined) { // Check specifically for undefined, so false is included
        query += ` AND is_offered = $${paramIndex}`;
        countQuery += ` AND is_offered = $${paramIndex}`;
        filterValues.push(isOffered); // boolean
        countFilterValues.push(isOffered); // boolean
        paramIndex++;
    }

    // Filter by from_month (greater than or equal to)
    if (fromMonth !== undefined && fromMonth !== null) {
         query += ` AND from_month >= $${paramIndex}`;
         countQuery += ` AND from_month >= $${paramIndex}`;
         filterValues.push(fromMonth); // integer
         countFilterValues.push(fromMonth); // integer
         paramIndex++;
    }

    // Filter by to_month (less than or equal to)
    if (toMonth !== undefined && toMonth !== null) {
        query += ` AND to_month <= $${paramIndex}`;
        countQuery += ` AND to_month <= $${paramIndex}`;
        filterValues.push(toMonth); // integer
        countFilterValues.push(toMonth); // integer
        paramIndex++;
    }


    // Add other filters here if needed

    query += `
      ORDER BY created_at DESC -- Default order
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
      console.error('❌ Error fetching service offerings:', error.message);
      throw new Error(`Could not fetch service offerings: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết dịch vụ cung cấp theo ID.
   * @param {string} id - UUID dịch vụ cung cấp.
   * @returns {Promise<Object|null>}
   */
  async getServiceOfferingById(travel_class_id, service_id) {
       try {
           const query = `
                SELECT travel_class_id, service_id, is_offered, from_month, to_month, created_at, updated_at
                FROM service_offerings
                WHERE travel_class_id = $1 AND service_id = $2;
           `;
           const result = await db.query(query, [travel_class_id, service_id]);
           if (result.rows.length === 0) {
               return null; // Service offering not found
           }
           return result.rows[0];
       } catch (error) {
           console.error(`❌ Error fetching service offering by ID ${id}:`, error.message);
           throw new Error(`Could not fetch service offering by ID: ${error.message}`);
       }
   }

  /**
   * Tạo dịch vụ cung cấp mới.
   * @param {Object} data - travel_class_id (UUID), service_id (UUID), is_offered (boolean), from_month (integer, 1-12), to_month (integer, 1-12).
   * @returns {Promise<Object>} Dịch vụ cung cấp đã tạo.
   */
  async createServiceOffering(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation (e.g., travel_class_id, service_id, is_offered, from_month, to_month are required)
      // TODO: Validate if travel_class_id and service_id exist in their respective tables
      // TODO: Validate from_month and to_month are integers between 1 and 12. to_month >= from_month

      const query = `
        INSERT INTO service_offerings (travel_class_id, service_id, is_offered, from_month, to_month)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING travel_class_id, service_id, is_offered, from_month, to_month, created_at, updated_at;
      `;
      const values = [
        data.travel_class_id, // UUID
        data.service_id,      // UUID
        data.is_offered,      // boolean
        data.from_month,      // integer
        data.to_month         // integer
      ];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating service offering:', error.message);
      throw new Error(`Could not create service offering: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật dịch vụ cung cấp.
   * @param {string} id - UUID dịch vụ cung cấp.
   * @param {Object} data - travel_class_id (UUID, optional), service_id (UUID, optional), is_offered (boolean, optional), from_month (integer, optional), to_month (integer, optional).
   * @returns {Promise<Object>} Dịch vụ cung cấp đã cập nhật.
   */
  async updateServiceOffering(travel_class_id, service_id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // TODO: Add input validation
      // TODO: Validate if travel_class_id and service_id exist if provided
      // TODO: Validate from_month and to_month

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (data.travel_class_id !== undefined) {
          updateFields.push(`travel_class_id = $${paramIndex}`);
          values.push(data.travel_class_id); // UUID
          paramIndex++;
      }
      if (data.service_id !== undefined) {
          updateFields.push(`service_id = $${paramIndex}`);
          values.push(data.service_id); // UUID
          paramIndex++;
      }
      if (data.is_offered !== undefined) {
          updateFields.push(`is_offered = $${paramIndex}`);
          values.push(data.is_offered); // boolean
          paramIndex++;
      }
       if (data.from_month !== undefined && data.from_month !== null) {
          updateFields.push(`from_month = $${paramIndex}`);
          values.push(data.from_month); // integer
          paramIndex++;
      }
       if (data.to_month !== undefined && data.to_month !== null) {
          updateFields.push(`to_month = $${paramIndex}`);
          values.push(data.to_month); // integer
          paramIndex++;
      }

      if (updateFields.length === 0) {
          // No fields to update
          await client.query('ROLLBACK'); // No changes, rollback the BEGIN
          const existing = await this.getServiceOfferingById(travel_class_id, service_id); // Fetch current data
          if (!existing) {
              throw new Error('Service offering not found');
          }
          return existing; // Return existing data if no updates were requested
      }

      updateFields.push(`updated_at = NOW()`);

      values.push(travel_class_id); // composite key
      values.push(service_id);
      const query = `
        UPDATE service_offerings
        SET ${updateFields.join(', ')}
        WHERE travel_class_id = $${paramIndex} AND service_id = $${paramIndex + 1}
        RETURNING travel_class_id, service_id, is_offered, from_month, to_month, created_at, updated_at;
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Service offering not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error updating service offering ${id}:`, error.message);
      throw new Error(`Could not update service offering: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Xoá dịch vụ cung cấp.
   * @param {string} id - UUID dịch vụ cung cấp.
   * @returns {Promise<{deleted: true, id: string}>}
   */
  async deleteServiceOffering(travel_class_id, service_id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // No obvious direct constraints from other tables (like flights, reservations)
      // on service_offerings based on typical schema design for this kind of table.
      // If schema V2 has a direct link we are not aware of, add checks here.

      const query = `
        DELETE FROM service_offerings
        WHERE travel_class_id = $1 AND service_id = $2
        RETURNING travel_class_id, service_id;
      `;
      const result = await client.query(query, [travel_class_id, service_id]);

      if (result.rows.length === 0) {
        throw new Error('Service offering not found');
      }

      await client.query('COMMIT');
      return { deleted: true, travel_class_id: result.rows[0].travel_class_id, service_id: result.rows[0].service_id };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error deleting service offering ${id}:`, error.message);
      throw new Error(`Could not delete service offering: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

// Ensure exporting an instance
module.exports = new ServiceOfferingService();
