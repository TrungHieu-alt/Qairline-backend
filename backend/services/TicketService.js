const Ticket = require('../models/Ticket');
const CustomerService = require('./CustomerService');
const db = require('../config/db');
const { hasAvailableSeats } = require('../utils/serviceUtils');

class TicketService {
  async bookTicket(data, quantity = 1) {
    const { flight_id, customer_id, ticket_class_id, cancellation_deadline, seat_number } = data;
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // 1. Lấy chuyến bay và khóa bản ghi
      const flightRes = await client.query(
        'SELECT * FROM flights WHERE id = $1 FOR UPDATE',
        [flight_id]
      );
      if (flightRes.rows.length === 0) throw new Error('Flight not found');
      const flight = flightRes.rows[0];

      // 2. Lấy hạng vé
      const classRes = await client.query(
        'SELECT * FROM ticket_classes WHERE id = $1',
        [ticket_class_id]
      );
      if (classRes.rows.length === 0) throw new Error('Ticket class not found');
      const ticketClass = classRes.rows[0];

      // 3. Kiểm tra đủ chỗ
      if (!hasAvailableSeats(flight, ticket_class_id, quantity)) {
        throw new Error('Not enough available seats');
      }

      // 4. Kiểm tra ghế đã được đặt chưa (nếu có)
      if (seat_number) {
        const seatCheck = await client.query(
          'SELECT 1 FROM tickets WHERE flight_id = $1 AND seat_number = $2',
          [flight_id, seat_number]
        );
        if (seatCheck.rows.length > 0) throw new Error('Seat already taken');
      }

      // 5. Tính giá
      const basePrice = {
        1: flight.base_first_class_price,
        2: flight.base_business_class_price,
        3: flight.base_economy_class_price
      }[ticket_class_id];
      const price = basePrice * ticketClass.coefficient;

      // 6. Trừ ghế
      const seatColumn = {
        1: 'available_first_class_seats',
        2: 'available_business_class_seats',
        3: 'available_economy_class_seats'
      }[ticket_class_id];
      await client.query(
        `UPDATE flights SET ${seatColumn} = ${seatColumn} - $1 WHERE id = $2`,
        [quantity, flight_id]
      );

      // 7. Tạo vé
      const ticketRes = await client.query(
        `
        INSERT INTO tickets (
          flight_id, customer_id, ticket_class_id,
          seat_number, price, booking_date, ticket_status, ticket_code, cancellation_deadline
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), 'PendingPayment', gen_random_uuid(), $6)
        RETURNING *;
        `,
        [flight_id, customer_id, ticket_class_id, seat_number || null, price, cancellation_deadline]
      );

      await client.query('COMMIT');
      return new Ticket(ticketRes.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async bookTicketWithCustomer(data, user = null) {
    const { passengers, flight_id, ticket_class_id, cancellation_deadline } = data;
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      throw new Error('Passenger list is required');
    }
    if (!flight_id || !ticket_class_id || !cancellation_deadline) {
      throw new Error('Flight ID, ticket class ID, and cancellation deadline are required');
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const tickets = [];

      // Kiểm tra số ghế khả dụng cho toàn bộ hành khách
      const flightRes = await client.query('SELECT * FROM flights WHERE id = $1 FOR UPDATE', [flight_id]);
      if (flightRes.rows.length === 0) throw new Error('Flight not found');
      if (!hasAvailableSeats(flightRes.rows[0], ticket_class_id, passengers.length)) {
        throw new Error('Not enough available seats for all passengers');
      }

      for (const passenger of passengers) {
        const { email, first_name, last_name, phone_number, identity_number, seat_number } = passenger;
        if (!email || !first_name || !last_name || !phone_number || !identity_number) {
          throw new Error('Email, first name, last name, phone number, and identity number are required for each passenger');
        }

        // Tìm hoặc tạo khách hàng
        let customer;
        if (user && user.id && user.email === email) {
          customer = await CustomerService.updateCustomer(user.id, {
            first_name, last_name, phone_number, identity_number, email
          });
        } else {
          const existingCustomer = await client.query(
            'SELECT id FROM customers WHERE email = $1 FOR UPDATE',
            [email]
          );
          if (existingCustomer.rows.length > 0) {
            customer = await CustomerService.updateCustomer(existingCustomer.rows[0].id, {
              first_name, last_name, phone_number, identity_number, email
            });
          } else {
            customer = await CustomerService.createCustomer({
              first_name, last_name, phone_number, identity_number, email
            });
          }
        }

        // Đặt vé cho hành khách
        const ticketData = {
          flight_id,
          customer_id: customer.id,
          ticket_class_id,
          cancellation_deadline,
          seat_number
        };
        const ticket = await this.bookTicket(ticketData, 1);
        tickets.push({ ticket, customer: { id: customer.id, email, first_name, last_name } });
      }

      await client.query('COMMIT');
      return tickets;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async cancelTicket(ticket_id, email = null) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Lấy vé và khóa bản ghi
      const ticketRes = await client.query(
        'SELECT t.*, c.email FROM tickets t JOIN customers c ON t.customer_id = c.id WHERE t.id = $1 FOR UPDATE',
        [ticket_id]
      );
      if (ticketRes.rows.length === 0) throw new Error('Ticket not found');
      const ticket = ticketRes.rows[0];

      // Kiểm tra email (nếu có)
      if (email && ticket.email !== email) throw new Error('Email does not match ticket owner');

      // Kiểm tra đã hủy chưa
      if (ticket.ticket_status === 'Cancelled') throw new Error('Ticket already cancelled');

      // Kiểm tra hạn hủy
      const now = new Date();
      const deadline = new Date(ticket.cancellation_deadline);
      if (now > deadline) throw new Error('Cancellation deadline has passed');

      // Hủy vé
      const cancelRes = await client.query(
        `UPDATE tickets SET ticket_status = 'Cancelled' WHERE id = $1 RETURNING *`,
        [ticket_id]
      );

      // Tăng số ghế khả dụng
      const seatColumn = {
        1: 'available_first_class_seats',
        2: 'available_business_class_seats',
        3: 'available_economy_class_seats'
      }[ticket.ticket_class_id];
      await client.query(
        `UPDATE flights SET ${seatColumn} = ${seatColumn} + 1 WHERE id = $1`,
        [ticket.flight_id]
      );

      await client.query('COMMIT');
      return new Ticket(cancelRes.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

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

  async getTicketByCode(ticket_code) {
    const result = await db.query('SELECT * FROM tickets WHERE ticket_code = $1', [ticket_code]);
    return result.rows.length > 0 ? new Ticket(result.rows[0]) : null;
  }

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