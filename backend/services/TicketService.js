const Ticket = require('../models/Ticket');
const CustomerService = require('./CustomerService');
const db = require('../config/db');
const {
  hasAvailableSeats,
  seatColumnByClass,
  basePriceFieldByClass
} = require('../utils/serviceUtils');

class TicketService {
 

   /**
   * Book 1 vé đơn lẻ (hàm nội bộ, khoá chuyến bay & trừ ghế).
   * @param {Object} data
   * @param {number} quantity - Số ghế (mặc định 1).
   * @returns {Promise<Ticket>}
   */
  async bookTicket(data, quantity = 1) {
    const {
      flight_id,
      customer_id,
      ticket_class_id,
      cancellation_deadline,
      seat_number
    } = data;

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      /* 1. Lock chuyến bay */
      const flightRes = await client.query(
        'SELECT * FROM flights WHERE id = $1 FOR UPDATE',
        [flight_id]
      );
      if (flightRes.rows.length === 0) throw new Error('Flight not found');
      const flight = flightRes.rows[0];

      /* 2. Lấy thông tin hạng vé */
      const classRes = await client.query(
        'SELECT * FROM ticket_classes WHERE id = $1',
        [ticket_class_id]
      );
      if (classRes.rows.length === 0) throw new Error('Ticket class not found');
      const ticketClass = classRes.rows[0];
      const className   = ticketClass.class_name;

      /* 3. Kiểm tra đủ ghế */
      if (!hasAvailableSeats(flight, className, quantity)) {
        throw new Error('Not enough available seats');
      }

      /* 4. Ghế cụ thể đã được đặt chưa? */
      if (seat_number) {
        const seatCheck = await client.query(
          'SELECT 1 FROM tickets WHERE flight_id = $1 AND seat_number = $2',
          [flight_id, seat_number]
        );
        if (seatCheck.rows.length > 0) throw new Error('Seat already taken');
      }

      /* 5. Tính giá */
      const basePriceField = basePriceFieldByClass(className);
      const price          = flight[basePriceField] * ticketClass.coefficient;

      /* 6. Trừ ghế còn trống */
      const seatColumn = seatColumnByClass(className);
      await client.query(
        `UPDATE flights SET ${seatColumn} = ${seatColumn} - $1 WHERE id = $2`,
        [quantity, flight_id]
      );

      /* 7. Tạo vé */
      const ticketRes = await client.query(
        `INSERT INTO tickets (
            flight_id, customer_id, ticket_class_id,
            seat_number, price, booking_date,
            ticket_status, ticket_code, cancellation_deadline
         )
         VALUES ($1,$2,$3,$4,$5,NOW(),'PendingPayment',gen_random_uuid(),$6)
         RETURNING *`,
        [
          flight_id,
          customer_id,
          ticket_class_id,
          seat_number || null,
          price,
          cancellation_deadline
        ]
      );

      await client.query('COMMIT');
      return new Ticket(ticketRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }


   /**
   * Book nhiều vé cho danh sách hành khách, tự tạo hoặc cập nhật khách.
   * @param {Object} data - passengers[], flight_id, ticket_class_id, cancellation_deadline.
   * @param {Object|null} user - Người dùng đã đăng nhập (nếu có).
   * @returns {Promise<Array<{ticket: Ticket, customer: Object}>>}
   */
  async bookTicketWithCustomer(data, user = null) {
    const { passengers, flight_id, ticket_class_id, cancellation_deadline } = data;
    if (!passengers?.length) throw new Error('Passenger list is required');

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      /* Tra hạng vé + tên hạng trước */
      const classRes = await client.query(
        'SELECT * FROM ticket_classes WHERE id = $1',
        [ticket_class_id]
      );
      if (classRes.rows.length === 0) throw new Error('Ticket class not found');
      const ticketClass = classRes.rows[0];
      const className   = ticketClass.class_name;

      /* Lock flight + kiểm tra tổng ghế */
      const flightRes = await client.query(
        'SELECT * FROM flights WHERE id = $1 FOR UPDATE',
        [flight_id]
      );
      if (flightRes.rows.length === 0) throw new Error('Flight not found');
      if (!hasAvailableSeats(flightRes.rows[0], className, passengers.length)) {
        throw new Error('Not enough available seats for all passengers');
      }

      const tickets = [];
      for (const p of passengers) {
        const { email, first_name, last_name, phone_number, identity_number, seat_number } = p;
        if (!email || !first_name || !last_name || !phone_number || !identity_number) {
          throw new Error('Incomplete passenger data');
        }

        /* Tìm hoặc tạo khách */
        let customer;
        if (user?.id && user.email === email) {
          customer = await CustomerService.updateCustomer(user.id, {
            first_name, last_name, phone_number, identity_number, email
          });
        } else {
          const exist = await client.query(
            'SELECT id FROM customers WHERE email = $1 FOR UPDATE',
            [email]
          );
          if (exist.rows.length) {
            customer = await CustomerService.updateCustomer(exist.rows[0].id, {
              first_name, last_name, phone_number, identity_number, email
            });
          } else {
            customer = await CustomerService.createCustomer({
              first_name, last_name, phone_number, identity_number, email
            });
          }
        }

        /* Book vé cho từng khách */
        const ticket = await this.bookTicket({
          flight_id,
          customer_id: customer.id,
          ticket_class_id,
          cancellation_deadline,
          seat_number
        }, 1);

        tickets.push({ ticket, customer: { id: customer.id, email, first_name, last_name } });
      }

      await client.query('COMMIT');
      return tickets;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /** Huỷ vé (kiểm tra deadline & hoàn ghế). */
  async cancelTicket(ticket_id, email = null) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Lock vé + email
      const ticketRes = await client.query(
        `SELECT t.*, c.email
           FROM tickets t
           JOIN customers c ON t.customer_id = c.id
          WHERE t.id = $1
          FOR UPDATE`,
        [ticket_id]
      );
      if (!ticketRes.rows.length) throw new Error('Ticket not found');
      const ticket = ticketRes.rows[0];
      if (email && ticket.email !== email) throw new Error('Email does not match ticket owner');
      if (ticket.ticket_status === 'Cancelled') throw new Error('Ticket already cancelled');
      if (new Date() > new Date(ticket.cancellation_deadline)) throw new Error('Cancellation deadline has passed');

      /* Lấy className → cột ghế */
      const classNameRes = await client.query(
        'SELECT class_name FROM ticket_classes WHERE id = $1',
        [ticket.ticket_class_id]
      );
      const className  = classNameRes.rows[0].class_name;
      const seatColumn = seatColumnByClass(className);

      /* Đánh dấu huỷ & trả ghế */
      const cancelRes = await client.query(
        `UPDATE tickets SET ticket_status='Cancelled' WHERE id=$1 RETURNING *`,
        [ticket_id]
      );
      await client.query(
        `UPDATE flights SET ${seatColumn} = ${seatColumn} + 1 WHERE id=$1`,
        [ticket.flight_id]
      );

      await client.query('COMMIT');
      return new Ticket(cancelRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }


  /** Xác nhận vé từ PendingPayment → Confirmed. */
  async confirmTicket(ticket_id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `UPDATE tickets SET ticket_status = 'Confirmed' WHERE id = $1 AND ticket_status = 'PendingPayment' RETURNING *`,
        [ticket_id]
      );
      if (result.rows.length === 0) throw new Error('Ticket not found or not in PendingPayment status');
      await client.query('COMMIT');
      return new Ticket(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /** Tìm vé theo ticket_code (UUID). */
  async getTicketByCode(ticket_code) {
    const result = await db.query('SELECT * FROM tickets WHERE ticket_code = $1', [ticket_code]);
    return result.rows.length > 0 ? new Ticket(result.rows[0]) : null;
  }

  /** Lấy toàn bộ vé của 1 email khách hàng, kèm thông tin chuyến bay. */
  async getTicketsByEmail(email) {
    const result = await db.query(
      `
      SELECT 
        t.*,
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        a.name AS airline_name,
        r.departure_airport_id,
        r.arrival_airport_id,
        d.name AS departure_airport,
        a2.name AS arrival_airport
      FROM tickets t
      JOIN customers c ON t.customer_id = c.id
      JOIN flights f ON t.flight_id = f.id
      JOIN airlines a ON f.airline_id = a.id
      JOIN routes r ON f.route_id = r.id
      JOIN airports d ON r.departure_airport_id = d.id
      JOIN airports a2 ON r.arrival_airport_id = a2.id
      WHERE c.email = $1
      ORDER BY t.booking_date DESC
      `,
      [email]
    );
    return result.rows.map(row => ({
      ticket: new Ticket(row),
      flight_info: {
        flight_number: row.flight_number,
        departure_time: row.departure_time,
        arrival_time: row.arrival_time,
        airline_name: row.airline_name,
        departure_airport: row.departure_airport,
        arrival_airport: row.arrival_airport
      }
    }));
  }


    /**
   * Thống kê vé theo điều kiện.
   * @param {Object} filters - flight_id, start_date, end_date, ticket_status.
   * @returns {Promise<Object>} Số vé & doanh thu.
   */
  async getTicketStats({ flight_id, start_date, end_date, ticket_status }) {
    let query = `
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN ticket_status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed_tickets,
        SUM(CASE WHEN ticket_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_tickets,
        SUM(CASE WHEN ticket_status = 'PendingPayment' THEN 1 ELSE 0 END) as pending_tickets,
        SUM(price) as total_revenue
      FROM tickets
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (flight_id) {
      query += ` AND flight_id = $${paramIndex++}`;
      values.push(flight_id);
    }
    if (start_date) {
      query += ` AND booking_date >= $${paramIndex++}`;
      values.push(start_date);
    }
    if (end_date) {
      query += ` AND booking_date <= $${paramIndex++}`;
      values.push(end_date);
    }
    if (ticket_status) {
      query += ` AND ticket_status = $${paramIndex++}`;
      values.push(ticket_status);
    }

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = new TicketService();