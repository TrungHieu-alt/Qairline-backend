const db = require('../config/db'); // Giả định đã cấu hình kết nối DB
const crypto = require('crypto'); // Cần import module crypto để tạo UUID

class FlightService {

    /**
     * Lấy toàn bộ chuyến bay, sắp xếp theo giờ khởi hành tăng dần.
     * @returns {Promise<Array<Object>>}
     */
    async getAllFlights() {
        try {
            const query = `
                SELECT
                    f.id,
                    f.aircraft_id,
                    f.source_airport_id,
                    f.destination_airport_id,
                    f.departure_time,
                    f.arrival_time,
                    al.name AS airline_name,
                    at.name AS aircraft_type,
                    s_ap.name AS source_airport_name,
                    s_ap.code AS source_airport_code,
                    d_ap.name AS destination_airport_name,
                    d_ap.code AS destination_airport_code
                FROM flights f
                JOIN aircrafts ac ON f.aircraft_id = ac.id
                JOIN airlines al ON ac.airline_id = al.id
                JOIN aircraft_types at ON ac.aircraft_type_id = at.id
                JOIN airports s_ap ON f.source_airport_id = s_ap.id
                JOIN airports d_ap ON f.destination_airport_id = d_ap.id
                ORDER BY f.departure_time ASC;
            `;
            const result = await db.query(query);
            // Map results if necessary to match desired output structure
            return result.rows;
        } catch (error) {
            console.error('❌ Error fetching all flights:', error.message);
            throw new Error(`Could not fetch all flights: ${error.message}`);
        }
    }

    /**
     * Lấy chi tiết chuyến bay theo ID.
     * @param {string} id - UUID chuyến bay.
     * @returns {Promise<Object|null>}
     */
    async getFlightById(id) {
        try {
            const query = `
                SELECT
                    f.*,
                    al.name AS airline_name,
                    at.name AS aircraft_type,
                    s_ap.name AS source_airport_name,
                    s_ap.code AS source_airport_code,
                    d_ap.name AS destination_airport_name,
                    d_ap.code AS destination_airport_code
                FROM flights f
                JOIN aircrafts ac ON f.aircraft_id = ac.id
                JOIN airlines al ON ac.airline_id = al.id
                JOIN aircraft_types at ON ac.aircraft_type_id = at.id
                JOIN airports s_ap ON f.source_airport_id = s_ap.id
                JOIN airports d_ap ON f.destination_airport_id = d_ap.id
                WHERE f.id = $1;
            `;
            const result = await db.query(query, [id]);
            if (result.rows.length === 0) return null;
            // Map result to a Flight model or plain object
            return result.rows[0];
        } catch (error) {
            console.error(`❌ Error fetching flight by ID ${id}:`, error.message);
            throw new Error(`Could not fetch flight: ${error.message}`);
        }
    }

    /**
     * Tìm chuyến bay theo chặng và ngày.
     * @param {Object} params - from_airport_id, to_airport_id, date (YYYY-MM-DD).
     * @returns {Promise<Array<Object>>}
     */
    async searchFlights({ from_airport_id, to_airport_id, date }) {
        try {
            const query = `
                SELECT
                    f.id,
                    f.departure_time,
                    f.arrival_time,
                    al.name AS airline_name,
                    at.name AS aircraft_type,
                    s_ap.name AS source_airport_name,
                    d_ap.name AS destination_airport_name
                FROM flights f
                JOIN aircrafts ac ON f.aircraft_id = ac.id
                JOIN airlines al ON ac.airline_id = al.id
                JOIN aircraft_types at ON ac.aircraft_type_id = at.id
                JOIN airports s_ap ON f.source_airport_id = s_ap.id
                JOIN airports d_ap ON f.destination_airport_id = d_ap.id
                WHERE f.source_airport_id = $1
                  AND f.destination_airport_id = $2
                  AND DATE(f.departure_time) = $3
                ORDER BY f.departure_time ASC;
            `;
            const result = await db.query(query, [from_airport_id, to_airport_id, date]);
            return result.rows;
        } catch (error) {
            console.error('❌ Error searching flights:', error.message);
            throw new Error(`Could not search flights: ${error.message}`);
        }
    }

    /**
     * Tạo chuyến bay mới.
     * @param {Object} data - aircraft_id, source_airport_id, destination_airport_id, departure_time, arrival_time.
     * @returns {Promise<Object>} The created flight.
     */
    async createFlight(data) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Insert into flights table
            const insertFlightQuery = `
                INSERT INTO flights (
                    id, aircraft_id, source_airport_id, destination_airport_id,
                    departure_time, arrival_time
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, aircraft_id;
            `;
            const newFlightId = crypto.randomUUID(); // Generate UUID for new flight
            const flightValues = [
                newFlightId,
                data.aircraft_id,
                data.source_airport_id,
                data.destination_airport_id,
                data.departure_time,
                data.arrival_time,
            ];
            const flightResult = await client.query(insertFlightQuery, flightValues);
            const newFlight = flightResult.rows[0];
            const aircraftId = newFlight.aircraft_id;


            // 2. Get seat layout from aircraft_seat_layout
            const seatLayoutQuery = `
                SELECT asl.travel_class_id, asl.capacity
                FROM aircraft_seat_layout asl
                JOIN aircrafts a ON asl.aircraft_type_id = a.aircraft_type_id
                WHERE a.id = $1;
            `;
            const seatLayoutResult = await client.query(seatLayoutQuery, [aircraftId]);
            if (seatLayoutResult.rows.length === 0) {
                throw new Error('Seat layout not found for selected aircraft');
            }

            const seatDetailsValues = [];
            for (const row of seatLayoutResult.rows) {
                for (let i = 0; i < row.capacity; i++) {
                    seatDetailsValues.push([
                        crypto.randomUUID(),
                        newFlightId,
                        row.travel_class_id,
                    ]);
                }
            }

            if (seatDetailsValues.length > 0) {
                const insertSeatQuery = `
                    INSERT INTO seat_details (id, flight_id, travel_class_id)
                    SELECT unnest($1::uuid[]), unnest($2::uuid[]), unnest($3::uuid[]);
                `;
                const seatArrays = [
                    seatDetailsValues.map(r => r[0]),
                    seatDetailsValues.map(r => r[1]),
                    seatDetailsValues.map(r => r[2]),
                ];
                await client.query(insertSeatQuery, seatArrays);
            }



            await client.query('COMMIT');

            // Return the created flight details (you might want to fetch it again with JOINs)
            // Or construct a response object
            return this.getFlightById(newFlightId); // Fetch the flight with all details

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error creating flight:', error.message);
            throw new Error(`Could not create flight: ${error.message}`);
        } finally {
            client.release();
        }
    }


    /**
     * Cập nhật thông tin chuyến bay.
     * @param {string} id - UUID chuyến bay.
     * @param {Object} data - Dữ liệu cập nhật.
     * @returns {Promise<Object>} The updated flight.
     */
    async updateFlight(id, data) {
       const client = await db.connect();
       try {
           await client.query('BEGIN');

           // Build dynamic update query
           const fields = [];
           const values = [];
           let paramIndex = 1;

           // Only allow updating certain fields
           const allowedFields = [
             'aircraft_id',
             'source_airport_id', 'destination_airport_id',
             'departure_time', 'arrival_time'
           ];

           allowedFields.forEach(field => {
               if (data[field] !== undefined) {
                   fields.push(`${field} = $${paramIndex++}`);
                   values.push(data[field]);
               }
           });

           if (fields.length === 0) {
               throw new Error('No valid fields provided for update');
           }

           values.push(id); // Add ID for WHERE clause

           const updateQuery = `
               UPDATE flights
               SET ${fields.join(', ')}
               WHERE id = $${paramIndex}
               RETURNING *;
           `;

           const result = await client.query(updateQuery, values);

           if (result.rows.length === 0) {
               throw new Error('Flight not found');
           }

           await client.query('COMMIT');
           return this.getFlightById(id); // Return updated flight with full details

       } catch (error) {
           await client.query('ROLLBACK');
           console.error(`❌ Error updating flight ${id}:`, error.message);
           throw new Error(`Could not update flight: ${error.message}`);
       } finally {
           client.release();
       }
    }


    /**
     * Trì hoãn chuyến bay.
     * Cập nhật thời gian bay và trạng thái. Không tạo thông báo tự động.
     * @param {string} flightId - UUID chuyến bay.
     * @param {Date} newDeparture - Thời gian khởi hành mới.
     * @param {Date} newArrival - Thời gian đến mới.
     * @returns {Promise<Object>} The updated flight.
     */
    async delayFlight(flightId, newDeparture, newArrival) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Cập nhật bảng flights
            const updateFlightQuery = `
                UPDATE flights
                SET departure_time = $1,
                    arrival_time = $2
                WHERE id = $3
                RETURNING *;
            `;
            const flightResult = await client.query(updateFlightQuery, [newDeparture, newArrival, flightId]);
            if (flightResult.rows.length === 0) {
                throw new Error('Flight not found');
            }
            const updatedFlight = flightResult.rows[0];

            // This logic needs re-evaluation based on where cancellation policy/deadline is stored in V2.
            // Assuming cancellation deadline is per reservation or a general flight rule.
            // If per reservation, you might update a field in reservations.
            // If general rule, no DB update needed here, logic lives elsewhere.

            return this.getFlightById(flightId); // Return updated flight with full details
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`❌ Error delaying flight ${flightId}:`, error.message);
            throw new Error(`Could not delay flight: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Hủy chuyến bay.
     * Cập nhật trạng thái chuyến bay và chỗ ngồi liên quan. Không tạo thông báo tự động.
     * @param {string} flightId - UUID chuyến bay.
     * @returns {Promise<Object>} The cancelled flight.
     */
    async cancelFlight(flightId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Xoá các ghế liên quan và chuyến bay
            await client.query('DELETE FROM seat_details WHERE flight_id = $1', [flightId]);
            const flightRes = await client.query('DELETE FROM flights WHERE id = $1 RETURNING *', [flightId]);
            if (flightRes.rows.length === 0) throw new Error('Flight not found');
            const cancelledFlight = flightRes.rows[0];


            await client.query('COMMIT');
            return cancelledFlight;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`❌ Error cancelling flight ${flightId}:`, err.message);
            throw new Error(`Could not cancel flight: ${err.message}`);
        } finally {
            client.release();
        }
    }


    /**
     * Xoá cứng chuyến bay – CHỈ khi chưa có đặt chỗ/chỗ ngồi liên quan.
     * @param {string} id - UUID chuyến bay.
     * @returns {Promise<{deleted: true}>}
     */
    async deleteFlight(id) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Check for related seat_details
            const seatDetailsRef = await client.query(
                'SELECT 1 FROM seat_details WHERE flight_id = $1 LIMIT 1',
                [id]
            );
            if (seatDetailsRef.rows.length) {
                throw new Error('Cannot delete: flight has related seat details');
            }

            // Now delete the flight
            const deleteResult = await client.query('DELETE FROM flights WHERE id = $1 RETURNING id', [id]);

            if (deleteResult.rows.length === 0) {
                 throw new Error('Flight not found'); // Should not happen if no seat_details/costs found
            }

            await client.query('COMMIT');
            return { deleted: true };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`❌ Error deleting flight ${id}:`, error.message);
            throw new Error(`Could not delete flight: ${error.message}`);
        } finally {
            client.release();
        }
    }
    /**
     * Lấy danh sách hành khách trên một chuyến bay cụ thể.
     * @param {string} flightId - UUID chuyến bay.
     * @returns {Promise<Array<Object>>} Danh sách hành khách với thông tin chỗ ngồi.
     */
    async getPassengersOnFlight(flightId) {
        try {
            const query = `
                SELECT
                    sd.id AS seat_detail_id,
                    tc.name AS travel_class_name
                FROM seat_details sd
                JOIN travel_classes tc ON sd.travel_class_id = tc.id
                WHERE sd.flight_id = $1;
            `;
            const result = await db.query(query, [flightId]);
            return result.rows;
        } catch (error) {
            console.error(`❌ Error fetching passengers for flight ${flightId}:`, error.message);
            throw new Error(`Could not fetch passengers for flight: ${error.message}`);
        }
    }

}

module.exports = new FlightService();
