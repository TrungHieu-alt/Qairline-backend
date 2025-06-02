const Customer = require('../models/Customer');
const db = require('../config/db');

class CustomerService {
    /**
   * Tạo khách hàng mới.
   * @param {Object} data - Thông tin khách hàng (first_name, last_name, birth_date, …).
   * @returns {Promise<Customer>} Khách hàng vừa được tạo.
   */
  async createCustomer(data) {
    const query = `
      INSERT INTO customers (first_name, last_name, birth_date, gender, identity_number, phone_number, email, address, country, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *;
    `;
    const values = [
      data.first_name,
      data.last_name,
      data.birth_date,
      data.gender,
      data.identity_number,
      data.phone_number,
      data.email,
      data.address,
      data.country
    ];
    const result = await db.query(query, values);
    return new Customer(result.rows[0]);
  }

  /**
 * Cập nhật khách hàng (chỉ các trường được truyền).
 * @param {number} id
 * @param {Object} data – {first_name?, last_name?, phone_number?, …}
 * @returns {Promise<Customer>}
 */
async updateCustomer(id, data) {
  const keys   = Object.keys(data);
  if (!keys.length) throw new Error('No update fields provided');

  // Xây câu UPDATE động: SET field1 = $2, field2 = $3, ...
  const setSQL = keys
    .map((k, idx) => `${k} = $${idx + 2}`)
    .join(', ');

  const values = [id, ...keys.map(k => data[k])];
  const res = await db.query(
    `UPDATE customers SET ${setSQL} WHERE id = $1 RETURNING *`,
    values
  );
  if (res.rows.length === 0) throw new Error('Customer not found');
  return new Customer(res.rows[0]);
}

/**
 * Xoá cứng khách hàng – từ chối nếu đã đặt vé.
 * @param {number} id
 * @returns {Promise<{deleted: true}>}
 */
async deleteCustomer(id) {
  const ref = await db.query(
    'SELECT 1 FROM tickets WHERE customer_id = $1 LIMIT 1',
    [id]
  );
  if (ref.rows.length) {
    throw new Error('Cannot delete: customer owns tickets');
  }
  await db.query('DELETE FROM customers WHERE id = $1', [id]);
  return { deleted: true };
}
}
module.exports = CustomerService;
