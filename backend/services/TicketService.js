const Ticket = require('../models/Ticket');
const CustomerService = require('./CustomerService');
const db = require('../config/db');
const { hasAvailableSeats } = require('../utils/serviceUtils');

class TicketService {
  async bookTicket(data) {
    const {
      flight_id,
      customer_id,
      ticket_class_id,
      cancellation_deadline
    } = data;

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // 1. Lấy chuyến bay và khóa bản ghi (FOR UPDATE)
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
      if (!hasAvailableSeats(flight, ticket_class_id, 1)) {
        throw new Error('Not enough available seats');
      }

      // 4. Tính giá
      const basePrice = {
        1: flight.base_first_class_price,
        2: flight.base_business_class_price,
        3: flight.base_economy_class_price
      }[ticket_class_id];

      const price = basePrice * ticketClass.coefficient;

      // 5. Trừ ghế
      const seatColumn = {
        1: 'available_first_class_seats',
        2: 'available_business_class_seats',
        3: 'available_economy_class_seats'
      }[ticket_class_id];

      await client.query(
        `UPDATE flights SET ${seatColumn} = ${seatColumn} - 1 WHERE id = $1`,
        [flight_id]
      );

      // 6. Tạo vé
      const ticketRes = await client.query(
        `
        INSERT INTO tickets (
          flight_id, customer_id, ticket_class_id,
          seat_number, price, booking_date, ticket_status, ticket_code, cancellation_deadline
        )
        VALUES ($1, $2, $3, NULL, $4, NOW(), 'PendingPayment', gen_random_uuid(), $5)
        RETURNING *;
        `,
        [flight_id, customer_id, ticket_class_id, price, cancellation_deadline]
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
    // Kiểm tra dữ liệu bắt buộc
    if (!data.email || !data.first_name || !data.last_name || !data.phone_number || !data.flight_id || !data.ticket_class_id || !data.cancellation_deadline) {
      throw new Error('Email, first name, last name, phone number, flight_id, ticket_class_id, and cancellation_deadline are required for booking');
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Tìm hoặc tạo khách hàng
      let customer;
      if (user && user.id) {
        // Đăng nhập: Sử dụng customer_id từ token
        customer = await CustomerService.updateCustomer(user.id, {
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          identity_number: data.identity_number,
          email: data.email
        });
      } else {
        // Không đăng nhập: Tìm hoặc tạo khách hàng dựa trên email
        const existingCustomer = await client.query(
          'SELECT id FROM customers WHERE email = $1 FOR UPDATE',
          [data.email]
        );
        if (existingCustomer.rows.length > 0) {
          customer = await CustomerService.updateCustomer(existingCustomer.rows[0].id, {
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: data.phone_number,
            identity_number: data.identity_number,
            email: data.email
          });
        } else {
          customer = await CustomerService.createCustomer({
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: data.phone_number,
            identity_number: data.identity_number,
            email: data.email
          });
        }
      }

      // Gọi bookTicket với customer_id
      const ticketData = {
        flight_id: data.flight_id,
        customer_id: customer.id,
        ticket_class_id: data.ticket_class_id,
        cancellation_deadline: data.cancellation_deadline
      };
      const ticket = await this.bookTicket(ticketData);

      await client.query('COMMIT');

      return {
        ticket,
        customer: {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async cancelTicket(ticket_id) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // 1. Lấy vé và khóa bản ghi
      const ticketRes = await client.query(
        'SELECT * FROM tickets WHERE id = $1 FOR UPDATE',
        [ticket_id]
      );
      if (ticketRes.rows.length === 0) throw new Error('Ticket not found');
      const ticket = ticketRes.rows[0];

      // 2. Kiểm tra đã hủy chưa
      if (ticket.ticket_status === 'Cancelled') throw new Error('Ticket already cancelled');

      // 3. Kiểm tra hạn hủy
      const now = new Date();
      const deadline = new Date(ticket.cancellation_deadline);
      if (now > deadline) throw new Error('Cancellation deadline has passed');

      // 4. Hủy vé
      const cancelRes = await client.query(
        `
        UPDATE tickets SET ticket_status = 'Cancelled' WHERE id = $1 RETURNING *;
        `,
        [ticket_id]
      );

      // 5. Tăng số ghế khả dụng cho chuyến bay
      const seatColumn = {
        1: 'available_first_class_seats',
        2: 'available_business_class_seats',
        3: 'available_economy_class_seats'
      }[ticket.ticket_class_id];

      await client.query(
        `
        UPDATE flights SET ${seatColumn} = ${seatColumn} + 1 WHERE id = $1;
        `,
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

  async getTicketByCode(ticket_code) {
    const result = await db.query('SELECT * FROM tickets WHERE ticket_code = $1', [ticket_code]);
    return result.rows.length > 0 ? new Ticket(result.rows[0]) : null;
  }
}

module.exports = new TicketService();