const db = require('../config/db'); // Giả định đã cấu hình kết nối DB
const crypto = require('crypto'); // Cần import module crypto để tạo UUID
// Có thể cần import FlightService nếu có tương tác trực tiếp, nhưng cân nhắc kỹ
// const FlightService = require('./FlightService');

class ReservationService {

    /**
     * Tạo đặt chỗ mới.
     * Xử lý việc tạo bản ghi trong reservations, passengers (nếu là hành khách mới),
     * và seat_details. Tính toán giá ban đầu.
     * @param {Object} data - Dữ liệu đặt chỗ: flight_id, travel_class_id, passenger_details (mảng), seat_selections (mảng tùy chọn), payment_info, etc.
     * @returns {Promise<Object>} Thông tin đặt chỗ đã tạo.
     */
    async createReservation(data) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const {
                flight_id,
                travel_class_id, // Hạng du lịch cho đặt chỗ này (có thể nhiều hạng?)
                passenger_details, // Mảng các object { first_name, last_name, identity_number, email, ... }
                seat_selections = [], // Mảng các object { passenger_index, main_seat_detail_id } // Renamed for clarity
                payment_info // Thông tin thanh toán (có thể phức tạp, liên quan PaymentService)
            } = data;

            // TODO: Validate input data (check required fields, data types)

            // 1. Kiểm tra chuyến bay và hạng du lịch
            // Cần lấy thông tin chuyến bay, đảm bảo tồn tại và đang hoạt động
            // Cần kiểm tra travel_class_id hợp lệ cho chuyến bay này (có trong flight_costs)
            const flightInfoQuery = `
                SELECT
                    f.id, f.flight_status,
                    fc.id AS flight_cost_id, fc.base_price
                FROM flights f
                JOIN flight_costs fc ON f.id = fc.flight_id
                WHERE f.id = $1 AND fc.travel_class_id = $2 AND f.flight_status <> 'Cancelled';
            `;
            const flightInfoResult = await client.query(flightInfoQuery, [flight_id, travel_class_id]);

            if (flightInfoResult.rows.length === 0) {
                 throw new Error('Invalid flight or travel class selected');
            }
            const flightInfo = flightInfoResult.rows[0];
            if (flightInfo.flight_status !== 'Scheduled' && flightInfo.flight_status !== 'Delayed') {
                 throw new Error(`Flight ${flightInfo.flight_status}. Cannot create reservation.`);
            }

            const basePrice = flightInfo.base_price;
            const flightCostId = flightInfo.flight_cost_id;


            // 2. Xử lý thông tin hành khách
            const passengerIds = [];
            for (const passenger of passenger_details) {
                // TODO: Check if passenger already exists based on identity_number or email
                // If exists, use existing passenger ID. If not, create new.
                // For now, let's assume creating new passengers
                const newPassengerId = crypto.randomUUID();
                const insertPassengerQuery = `
                    INSERT INTO passengers (id, first_name, last_name, email, identity_number, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id;
                `;
                const passengerValues = [
                    newPassengerId,
                    passenger.first_name,
                    passenger.last_name,
                    passenger.email,
                    passenger.identity_number,
                ];
                const passengerResult = await client.query(insertPassengerQuery, passengerValues);
                passengerIds.push(passengerResult.rows[0].id);
            }


            // 3. Tạo bản ghi đặt chỗ (Reservation)
            const newReservationId = crypto.randomUUID();
            const reservationCode = this.generateReservationCode(); // TODO: Implement code generation
            const insertReservationQuery = `
                 INSERT INTO reservations (
                     id, flight_id, reservation_code, status, total_amount,
                     payment_status, booked_date, created_at, updated_at
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
                 RETURNING *;
             `;
             // TODO: Calculate total_amount based on basePrice, number of passengers, taxes, fees, extra services
             const numberOfPassengers = passenger_details.length;
             const estimatedTotalAmount = basePrice * numberOfPassengers; // Simplistic calculation
             const reservationValues = [
                 newReservationId,
                 flight_id,
                 reservationCode,
                 'PendingPayment', // Initial status
                 estimatedTotalAmount, // Placeholder amount
                 'Pending', // Payment status
             ];
            const reservationResult = await client.query(insertReservationQuery, reservationValues);
            const newReservation = reservationResult.rows[0];


            // 4. Xử lý chọn chỗ ngồi và tạo seat_details records for this reservation
            // Assumption based on likely V2 schema: seat_details table links a RESERVATION, a PASSENGER,
            // a FLIGHT, a TRAVEL_CLASS, and references the original seat_detail ID from flight creation.
            const finalSeatDetailsInserts = [];
            const updatedMainSeatIds = []; // IDs in the main seat_details table to update status

            if (seat_selections.length > 0) {
                 // User selected specific seats (from the main seat_details list created by createFlight)
                 if (seat_selections.length !== passenger_details.length) {
                     throw new Error('Number of seat selections must match number of passengers');
                 }

                 for (let i = 0; i < seat_selections.length; i++) {
                      const selection = seat_selections[i];
                      const passengerId = passengerIds[selection.passenger_index];

                      // Verify the selected main_seat_detail_id is available for this flight and class
                      const seatCheckQuery = `
                          SELECT id, status, travel_class_id
                          FROM seat_details -- Main flight seats table
                          WHERE id = $1 AND flight_id = $2 AND travel_class_id = $3 AND status = 'Available';
                      `;
                      const seatCheckResult = await client.query(seatCheckQuery, [selection.main_seat_detail_id, flight_id, travel_class_id]);

                      if (seatCheckResult.rows.length === 0) {
                           // Also check if the seat is already booked by someone else recently (race condition)
                          throw new Error(`Selected seat ${selection.main_seat_detail_id} is not available or invalid.`);
                      }

                       // Add the ID from the main seat_details table to update its status
                       updatedMainSeatIds.push(selection.main_seat_detail_id);

                       // Prepare data for inserting into the seat_details table (linking reservation)
                       finalSeatDetailsInserts.push([
                           crypto.randomUUID(), // ID for this specific booking seat detail record
                           newReservationId,
                           flight_id,
                           passengerId,
                           travel_class_id,
                           selection.main_seat_detail_id, // Reference to the main seat_detail record
                           'Booked', // Status of this booking seat detail record
                       ]);
                  }

                  // Update status in the main seat_details table (set to 'Booked')
                  if (updatedMainSeatIds.length > 0) {
                      const updateMainSeatsQuery = `
                          UPDATE seat_details
                          SET status = 'Booked', updated_at = NOW()
                          WHERE id = ANY($1::uuid[]);
                      `;
                      await client.query(updateMainSeatsQuery, [updatedMainSeatIds]);
                  }


              } else {
                  // Auto-assign seats
                  const getAvailableSeatsQuery = `
                      SELECT id, travel_class_id
                      FROM seat_details -- Main flight seats table
                      WHERE flight_id = $1 AND travel_class_id = $2 AND status = 'Available'
                      LIMIT $3; -- Limit to number of passengers
                  `;
                  const availableSeatsResult = await client.query(getAvailableSeatsQuery, [flight_id, travel_class_id, passenger_details.length]);

                  if (availableSeatsResult.rows.length < passenger_details.length) {
                      throw new Error('Not enough available seats for the selected class.');
                  }

                  const assignedMainSeatDetails = availableSeatsResult.rows;
                  for (let i = 0; i < passenger_details.length; i++) {
                      const passengerId = passengerIds[i];
                      const assignedSeat = assignedMainSeatDetails[i];

                      // Add the ID from the main seat_details table to update its status
                      updatedMainSeatIds.push(assignedSeat.id);

                       // Prepare data for inserting into the seat_details table (linking reservation)
                       finalSeatDetailsInserts.push([
                           crypto.randomUUID(), // ID for this specific booking seat detail record
                           newReservationId,
                           flight_id,
                           passengerId,
                           travel_class_id,
                           assignedSeat.id, // Reference to the main seat_detail record
                           'Booked', // Status of this booking seat detail record
                       ]);
                  }

                   // Update status in the main seat_details table (set to 'Booked')
                   if (updatedMainSeatIds.length > 0) {
                       const updateMainSeatsQuery = `
                           UPDATE seat_details
                           SET status = 'Booked', updated_at = NOW()
                           WHERE id = ANY($1::uuid[]);
                       `;
                       await client.query(updateMainSeatsQuery, [updatedMainSeatIds]);
                   }
              }

             // Insert the booking-specific seat_details records
             if (finalSeatDetailsInserts.length > 0) {
                 // Assuming the structure of seat_details is:
                 // id, reservation_id, flight_id, passenger_id, travel_class_id, main_seat_detail_id, status, created_at, updated_at
                 const insertSeatDetailsQuery = `
                      INSERT INTO seat_details (id, reservation_id, flight_id, passenger_id, travel_class_id, main_seat_detail_id, status, created_at, updated_at)
                      SELECT unnest($1::uuid[]), unnest($2::uuid[]), unnest($3::uuid[]), unnest($4::uuid[]), unnest($5::uuid[]), unnest($6::uuid[]), unnest($7::seat_status[]), NOW(), NOW(); -- Assuming seat_status enum
                  `;
                 const unnestSeatDetailsValues = [
                     finalSeatDetailsInserts.map(row => row[0]), // ids
                     finalSeatDetailsInserts.map(row => row[1]), // reservation_ids (all same newReservationId)
                     finalSeatDetailsInserts.map(row => row[2]), // flight_ids (all same flight_id)
                     finalSeatDetailsInserts.map(row => row[3]), // passenger_ids
                     finalSeatDetailsInserts.map(row => row[4]), // travel_class_ids (all same travel_class_id)
                     finalSeatDetailsInserts.map(row => row[5]), // main_seat_detail_ids (reference to the *other* seat_details record)
                     finalSeatDetailsInserts.map(row => row[6]), // statuses (all 'Booked' for these new records)
                 ];
                 await client.query(insertSeatDetailsQuery, unnestSeatDetailsValues);
             }

            // TODO: 5. Handle Payment (likely involves calling PaymentService)
            // For now, payment_status is 'Pending'. Actual payment processing happens later.
            // The total_amount calculation needs to be accurate, including taxes, fees, extra services.
            // This might involve querying flight_service_offerings, tax rates, etc.

            // TODO: 6. Create Reservation Breakdowns (if reservation_breakdowns table exists)
            // Insert details about price components (base fare, taxes, fees)

            await client.query('COMMIT');

            // Return the created reservation details
            // You might want to fetch the full reservation details with joins here
            // return this.getReservationById(newReservationId); // Implement this method
            // Returning just the reservation record for now
            return newReservation;


        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error creating reservation:', error.message);
            throw new Error(`Could not create reservation: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Lấy thông tin chi tiết đặt chỗ theo ID.
     * @param {string} id - UUID đặt chỗ.
     * @returns {Promise<Object|null>}
     */
    async getReservationById(id) {
         // TODO: Implement this method
         // Needs complex JOINs to fetch reservation info, linked flight info,
         // passenger details (via seat_details), seat details for this reservation (including seat number),
         // and price breakdowns.
         console.warn(`TODO: Implement getReservationById(${id})`);
         // Placeholder query
         const query = `SELECT * FROM reservations WHERE id = $1`;
         const result = await db.query(query, [id]);
         return result.rows.length > 0 ? result.rows[0] : null;
     }

    /**
      * Tra cứu đặt chỗ theo mã đặt chỗ.
      * @param {string} code - Mã đặt chỗ.
      * @returns {Promise<Object|null>}
      */
     async getReservationByCode(code) {
         // TODO: Implement this method
         // Similar to getReservationById but filter by reservation_code.
         console.warn(`TODO: Implement getReservationByCode(${code})`);
         // Placeholder query
         const query = `SELECT * FROM reservations WHERE reservation_code = $1`;
         const result = await db.query(query, [code]);
         return result.rows.length > 0 ? result.rows[0] : null;
     }

     /**
      * Hủy đặt chỗ theo ID.
      * @param {string} id - UUID đặt chỗ.
      * @returns {Promise<Object>} Thông tin đặt chỗ đã hủy.
      */
     async cancelReservation(id) {
         const client = await db.connect();
         try {
             await client.query('BEGIN');

             // 1. Cập nhật trạng thái đặt chỗ
             const reservationRes = await client.query(
                 `UPDATE reservations SET status = 'Cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
                 [id]
             );
             if (reservationRes.rows.length === 0) {
                 throw new Error('Reservation not found');
             }
             const cancelledReservation = reservationRes.rows[0];

             // 2. Cập nhật trạng thái của các seat_details liên quan đến đặt chỗ này
             const updateSeatDetailsQuery = `
                 UPDATE seat_details
                 SET status = 'Cancelled', updated_at = NOW()
                 WHERE reservation_id = $1 AND status <> 'Cancelled' RETURNING main_seat_detail_id; -- Get main seat IDs
             `;
             const seatDetailsRes = await client.query(updateSeatDetailsQuery, [id]);
             const mainSeatIdsToFree = seatDetailsRes.rows.map(row => row.main_seat_detail_id);


             // 3. Giải phóng chỗ ngồi trong bảng seat_details chính (tạo bởi createFlight)
             // Set status back to 'Available' ONLY if NO OTHER reservation is linked to that main seat detail.
             // This requires a more complex check. Simplistic approach below might cause race conditions.
             // A robust solution might involve checking COUNT of active seat_details linked to main_seat_detail_id.

             if (mainSeatIdsToFree.length > 0) {
                  // Check if the main seat is linked to any *other* non-cancelled seat_details
                  const checkOtherBookingsQuery = `
                       SELECT DISTINCT main_seat_detail_id
                       FROM seat_details
                       WHERE main_seat_detail_id = ANY($1::uuid[])
                         AND reservation_id <> $2
                         AND status <> 'Cancelled';
                  `;
                  const otherBookingsRes = await client.query(checkOtherBookingsQuery, [mainSeatIdsToFree, id]);
                  const mainSeatsStillBooked = otherBookingsRes.rows.map(row => row.main_seat_detail_id);

                  // Filter out main seats that are still linked to other active bookings
                  const mainSeatsToReallyFree = mainSeatIdsToFree.filter(seatId => !mainSeatsStillBooked.includes(seatId));

                  if (mainSeatsToReallyFree.length > 0) {
                       const freeMainSeatsQuery = `
                            UPDATE seat_details
                            SET status = 'Available', updated_at = NOW()
                            WHERE id = ANY($1::uuid[]);
                       `;
                       await client.query(freeMainSeatsQuery, [mainSeatsToReallyFree]);
                  }
             }


             // TODO: 4. Handle refund logic (likely involves calling PaymentService)

             await client.query('COMMIT');

             // Return the updated reservation details
             return this.getReservationById(id); // Fetch the full details

         } catch (err) {
             await client.query('ROLLBACK');
             console.error(`❌ Error cancelling reservation ${id}:`, err.message);
             throw new Error(`Could not cancel reservation: ${err.message}`);
         } finally {
             client.release();
         }
     }


    /**
     * Helper function to generate a unique reservation code.
     * TODO: Implement proper code generation logic (e.g., alphanumeric, check for uniqueness).
     * @returns {string}
     */
     generateReservationCode() {
         // Simple placeholder implementation
         // In a real system, ensure uniqueness, maybe combine with timestamp or sequence
         return Math.random().toString(36).substring(2, 10).toUpperCase();
     }

    // TODO: Add more methods as needed, e.g., updateReservation, selectSeats, addExtraServices, processPaymentCallback, etc.

}

module.exports = new ReservationService();