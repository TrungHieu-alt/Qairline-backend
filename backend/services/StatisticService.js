const db = require('../config/db');

class StatisticService {
  /**
   * getAdminDashboardStats()
   * ----------------------------------------------------------------
   * Cung cấp các số liệu tổng quan cho Dashboard Admin dựa trên schema V2.
   * - Tổng số chuyến bay (flights)
   * - Tổng số đặt chỗ (reservations)
   * - Tổng số đặt chỗ đã thanh toán ('Y' status in payment_statuses)
   * - Tổng doanh thu từ các đặt chỗ đã thanh toán
   * - Tổng số thông báo (announcements)
   * - Tổng số hành khách (passengers)
   */
  async getAdminDashboardStats() {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM flights) AS total_flights,
        (SELECT COUNT(*) FROM reservations) AS total_reservations,
        (SELECT COUNT(*) FROM reservations r JOIN payment_statuses ps ON r.id = ps.reservation_id WHERE ps.status = 'Y') AS total_paid_reservations,
        (SELECT COALESCE(SUM(ps.amount), 0) FROM reservations r JOIN payment_statuses ps ON r.id = ps.reservation_id WHERE ps.status = 'Y') AS total_paid_revenue,
        (SELECT COUNT(*) FROM announcements) AS total_announcements,
        (SELECT COUNT(*) FROM passengers) AS total_passengers
      ;
    `;
    try {
       const { rows } = await db.query(query);
       return rows[0];
    } catch (error) {
        console.error('❌ Error fetching admin dashboard stats:', error.message);
        throw new Error(`Could not fetch admin dashboard stats: ${error.message}`);
    }
  }

  /**
   * getRecentReservations(limit = 10)
   * ----------------------------------------------------------------
   * Trả về `limit` đặt chỗ gần nhất cùng thông tin hành khách, chuyến bay, và thanh toán.
   * Sử dụng bảng reservations, passengers, seat_details, flights, payment_statuses.
   */
  async getRecentReservations(limit = 10) {
    // Joining multiple tables to get comprehensive info for recent reservations
    const query = `
      SELECT
        r.id AS reservation_id,
        p.first_name,
        p.last_name,
        sd.id AS seat_detail_id, -- Include seat detail ID
        sd.seat_number,
        tc.name AS travel_class_name, -- Assuming travel_classes table has name
        ps.amount AS paid_amount, -- Amount from payment_statuses
        ps.status AS payment_status, -- Status from payment_statuses ('Y'/'N')
        r.reservation_date, -- Booking date from reservations
        f.departure_time,
        f.arrival_time
      FROM reservations r
      JOIN passengers p ON r.passenger_id = p.id
      JOIN seat_details sd ON r.seat_id = sd.id
      JOIN flights f ON sd.flight_id = f.id -- Join through seat_details to get flight info
      JOIN travel_classes tc ON sd.travel_class_id = tc.id -- Join through seat_details to get travel class info
      JOIN payment_statuses ps ON r.id = ps.reservation_id -- Join to get payment info
      ORDER BY r.reservation_date DESC -- Order by booking date
      LIMIT $1;
    `;
    try {
        const { rows } = await db.query(query, [limit]);
        return rows;
    } catch (error) {
        console.error('❌ Error fetching recent reservations:', error.message);
        throw new Error(`Could not fetch recent reservations: ${error.message}`);
    }
  }


  /**
   * getPaidReservationTrends(days = 30)
   * ----------------------------------------------------------------
   * Đếm số đặt chỗ đã thanh toán ('Y' status) theo từng ngày trong `days` ngày gần nhất.
   * Trả về mảng [{ date: 'YYYY-MM-DD', paid_reservations: <number> }]
   * Sử dụng bảng reservations và payment_statuses.
   */
  async getPaidReservationTrends(days = 30) {
     const query = `
      SELECT
        DATE(r.reservation_date) AS date, -- Use reservation_date from reservations
        COUNT(r.id) AS paid_reservations
      FROM reservations r
      JOIN payment_statuses ps ON r.id = ps.reservation_id
      WHERE r.reservation_date >= NOW() - INTERVAL \'$1 days\'
      AND ps.status = 'Y' -- Only count paid reservations
      GROUP BY DATE(r.reservation_date)
      ORDER BY DATE(r.reservation_date);
    `;
    try {
        const { rows } = await db.query(query, [days]);
        return rows;
    } catch (error) {
        console.error('❌ Error fetching paid reservation trends:', error.message);
        throw new Error(`Could not fetch paid reservation trends: ${error.message}`);
    }
  }


   /**
    * getRevenueByTime({ startDate, endDate, interval })
    * ----------------------------------------------------------------
    * Thống kê tổng doanh thu và số lượng đặt chỗ đã thanh toán theo khoảng thời gian.
    * Sử dụng bảng reservations và payment_statuses.
    * @param {Object} options - startDate (ISO string), endDate (ISO string), interval ('day', 'month', 'year').
    * @returns {Promise<Array<Object>>} - Mảng các object thống kê theo interval.
    */
   async getRevenueByTime({ startDate, endDate, interval = 'day' }) {
       // TODO: Add input validation for dates and interval

       let dateTruncInterval;
       switch (interval) {
           case 'day':
               dateTruncInterval = 'day';
               break;
           case 'month':
               dateTruncInterval = 'month';
               break;
           case 'year':
               dateTruncInterval = 'year';
               break;
           default:
               throw new Error('Invalid interval. Use "day", "month", or "year".');
       }

       const query = `
         SELECT
           DATE_TRUNC('${dateTruncInterval}', r.reservation_date) AS time_period, -- Use reservation_date
           COUNT(r.id) AS total_paid_reservations,
           COALESCE(SUM(ps.amount), 0) AS total_revenue
         FROM reservations r
         JOIN payment_statuses ps ON r.id = ps.reservation_id
         WHERE r.reservation_date >= $1 AND r.reservation_date <= $2
         AND ps.status = 'Y' -- Only include paid reservations
         GROUP BY time_period
         ORDER BY time_period;
       `;
       const values = [startDate, endDate];

       try {
           const { rows } = await db.query(query, values);
           return rows;
       } catch (error) {
           console.error('❌ Error fetching revenue by time:', error.message);
           throw new Error(`Could not fetch revenue by time: ${error.message}`);
       }
   }

   /**
    * getRevenueByRoute({ startDate, endDate })
    * ----------------------------------------------------------------
    * Thống kê tổng doanh thu và số lượng đặt chỗ đã thanh toán theo tuyến bay.
    * Sử dụng bảng reservations, seat_details, flights, airports, payment_statuses.
    * @param {Object} options - startDate (ISO string), endDate (ISO string).
    * @returns {Promise<Array<Object>>} - Mảng các object thống kê theo tuyến bay.
    */
   async getRevenueByRoute({ startDate, endDate }) {
        // TODO: Add input validation for dates

        // A route is defined by source and destination airports in this schema
        const query = `
            SELECT
                f.source_airport_id,
                sa.code AS source_airport_code, -- Assuming airports table has code
                f.destination_airport_id,
                da.code AS destination_airport_code, -- Assuming airports table has code
                COUNT(res.id) AS total_paid_reservations,
                COALESCE(SUM(ps.amount), 0) AS total_revenue
            FROM reservations res
            JOIN payment_statuses ps ON res.id = ps.reservation_id
            JOIN seat_details sd ON res.seat_id = sd.id
            JOIN flights f ON sd.flight_id = f.id
            JOIN airports sa ON f.source_airport_id = sa.id
            JOIN airports da ON f.destination_airport_id = da.id
            WHERE res.reservation_date >= $1 AND res.reservation_date <= $2
            AND ps.status = 'Y' -- Only include paid reservations
            GROUP BY f.source_airport_id, sa.code, f.destination_airport_id, da.code
            ORDER BY total_revenue DESC;
        `;
        const values = [startDate, endDate];

        try {
            const { rows } = await db.query(query, values);
            return rows;
        } catch (error) {
            console.error('❌ Error fetching revenue by route:', error.message);
            throw new Error(`Could not fetch revenue by route: ${error.message}`);
        }
   }

    /**
     * getRevenueByAirline({ startDate, endDate })
     * ----------------------------------------------------------------
     * Thống kê tổng doanh thu và số lượng đặt chỗ đã thanh toán theo hãng hàng không.
     * Sử dụng bảng reservations, seat_details, flights, aircrafts, airlines, payment_statuses.
     * @param {Object} options - startDate (ISO string), endDate (ISO string).
     * @returns {Promise<Array<Object>>} - Mảng các object thống kê theo hãng hàng không.
     */
    async getRevenueByAirline({ startDate, endDate }) {
        // TODO: Add input validation for dates

        const query = `
            SELECT
                a.id AS airline_id,
                a.name AS airline_name, -- Assuming airlines table has name
                COUNT(res.id) AS total_paid_reservations,
                COALESCE(SUM(ps.amount), 0) AS total_revenue
            FROM reservations res
            JOIN payment_statuses ps ON res.id = ps.reservation_id
            JOIN seat_details sd ON res.seat_id = sd.id
            JOIN flights f ON sd.flight_id = f.id
            JOIN aircrafts ac ON f.aircraft_id = ac.id
            JOIN airlines a ON ac.airline_id = a.id
            WHERE res.reservation_date >= $1 AND res.reservation_date <= $2
            AND ps.status = 'Y' -- Only include paid reservations
            GROUP BY a.id, a.name
            ORDER BY total_revenue DESC;
        `;
        const values = [startDate, endDate];

        try {
            const { rows } = await db.query(query, values);
            return rows;
        } catch (error) {
            console.error('❌ Error fetching revenue by airline:', error.message);
            throw new Error(`Could not fetch revenue by airline: ${error.message}`);
        }
    }

     /**
      * getRevenueByTravelClass({ startDate, endDate })
      * ----------------------------------------------------------------
      * Thống kê tổng doanh thu và số lượng đặt chỗ đã thanh toán theo hạng ghế.
      * Sử dụng bảng reservations, seat_details, travel_classes, payment_statuses.
      * @param {Object} options - startDate (ISO string), endDate (ISO string).
      * @returns {Promise<Array<Object>>} - Mảng các object thống kê theo hạng ghế.
      */
     async getRevenueByTravelClass({ startDate, endDate }) {
         // TODO: Add input validation for dates

         const query = `
             SELECT
                 tc.id AS travel_class_id,
                 tc.name AS travel_class_name, -- Assuming travel_classes table has name
                 COUNT(res.id) AS total_paid_reservations,
                 COALESCE(SUM(ps.amount), 0) AS total_revenue
             FROM reservations res
             JOIN payment_statuses ps ON res.id = ps.reservation_id
             JOIN seat_details sd ON res.seat_id = sd.id
             JOIN travel_classes tc ON sd.travel_class_id = tc.id
             WHERE res.reservation_date >= $1 AND res.reservation_date <= $2
             AND ps.status = 'Y' -- Only include paid reservations
             GROUP BY tc.id, tc.name
             ORDER BY total_revenue DESC;
         `;
         const values = [startDate, endDate];

         try {
             const { rows } = await db.query(query, values);
             return rows;
         } catch (error) {
             console.error('❌ Error fetching revenue by travel class:', error.message);
             throw new Error(`Could not fetch revenue by travel class: ${error.message}`);
         }
     }


    /**
     * getRevenueByService({ startDate, endDate })
     * ----------------------------------------------------------------
     * Thống kê tổng doanh thu từ các dịch vụ bổ sung đã thanh toán theo loại dịch vụ.
     * Dựa trên schema, không rõ cách lưu trữ dịch vụ bổ sung cho từng đặt chỗ.
     * Phương thức này hiện tại không thể triển khai chính xác.
     */
    // async getRevenueByService({ startDate, endDate }) {
    //      // TODO: Add input validation for dates
    //      // TODO: Need schema information on how additional services are linked to a reservation
    //      console.warn("⚠️ getRevenueByService cannot be implemented without schema for reservation-specific services.");
    //      return []; // Cannot implement
    // }


   /**
    * getUpcomingFlights(limit = 10)
    * ----------------------------------------------------------------
    * Trả về `limit` chuyến bay sắp khởi hành (departure_time > NOW())
    * (Giữ nguyên phương thức này nếu vẫn cần cho Admin Dashboard)
    */
   async getUpcomingFlights(limit = 10) {
       const query = `
         SELECT *
         FROM flights
         WHERE departure_time > NOW()
         ORDER BY departure_time ASC
         LIMIT $1;`;
       try {
           const { rows } = await db.query(query, [limit]);
           return rows;
       } catch (error) {
           console.error('❌ Error fetching upcoming flights:', error.message);
           throw new Error(`Could not fetch upcoming flights: ${error.message}`);
       }
   }

}

module.exports = new StatisticService();
