const db = require('../config/db'); // Giả định đã cấu hình kết nối DB
const crypto = require('crypto'); // Cần import module crypto để tạo UUID

class FlightServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'FlightServiceError';
        this.code = code || 'UNKNOWN_ERROR';
    }
}

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
            return result.rows;
        } catch (error) {
            console.error('❌ Error fetching all flights:', error.message);
            throw new FlightServiceError(`Could not fetch all flights: ${error.message}`, 'FETCH_FLIGHTS_FAILED');
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
            return result.rows[0];
        } catch (error) {
            console.error(`❌ Error fetching flight by ID ${id}:`, error.message);
            throw new FlightServiceError(`Could not fetch flight: ${error.message}`, 'FETCH_FLIGHT_FAILED');
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
            throw new FlightServiceError(`Could not search flights: ${error.message}`, 'SEARCH_FLIGHTS_FAILED');
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

            // Kiểm tra departure_time < arrival_time
            if (new Date(data.departure_time) >= new Date(data.arrival_time)) {
                throw new FlightServiceError('Departure time must be before arrival time', 'INVALID_TIME');
            }

            // Kiểm tra source_airport_id != destination_airport_id
            if (data.source_airport_id === data.destination_airport_id) {
                throw new FlightServiceError('Source and destination airports must be different', 'INVALID_AIRPORTS');
            }

            // Kiểm tra khóa ngoại
            const aircraftCheck = await client.query('SELECT 1 FROM aircrafts WHERE id = $1', [data.aircraft_id]);
            if (aircraftCheck.rows.length === 0) {
                throw new FlightServiceError('Invalid aircraft_id', 'INVALID_AIRCRAFT');
            }
            const airportCheck = await client.query(
                'SELECT id FROM airports WHERE id IN ($1, $2)',
                [data.source_airport_id, data.destination_airport_id]
            );
            if (airportCheck.rows.length !== 2) {
                throw new FlightServiceError('Invalid source or destination airport', 'INVALID_AIRPORT');
            }

            // Chuẩn hóa thời gian
            const departureTime = new Date(data.departure_time).toISOString();
            const arrivalTime = new Date(data.arrival_time).toISOString();

            // 1. Insert into flights table
            const insertFlightQuery = `
                INSERT INTO flights (
                    id, aircraft_id, source_airport_id, destination_airport_id,
                    departure_time, arrival_time
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, aircraft_id;
            `;
            const newFlightId = crypto.randomUUID();
            const flightValues = [
                newFlightId,
                data.aircraft_id,
                data.source_airport_id,
                data.destination_airport_id,
                departureTime,
                arrivalTime,
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
                throw new FlightServiceError('Seat layout not found for selected aircraft', 'NO_SEAT_LAYOUT');
            }

            // Kiểm tra tổng số ghế
            const totalSeatsQuery = `
                SELECT total_seats
                FROM aircraft_types at
                JOIN aircrafts a ON at.id = a.aircraft_type_id
                WHERE a.id = $1
            `;
            const totalSeatsResult = await client.query(totalSeatsQuery, [aircraftId]);
            const totalSeats = totalSeatsResult.rows[0].total_seats;
            const totalCapacity = seatLayoutResult.rows.reduce((sum, row) => sum + row.capacity, 0);
            if (totalCapacity > totalSeats) {
                throw new FlightServiceError(
                    `Total seat capacity (${totalCapacity}) exceeds aircraft's total seats (${totalSeats})`,
                    'EXCEEDS_CAPACITY'
                );
            }

            // Tạo seat_details cùng seat_number
            const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
            let seatIndex = 0;
            const seatDetailsValues = [];
            for (const row of seatLayoutResult.rows) {
                for (let i = 0; i < row.capacity; i++) {
                    const seatNumber = `${Math.floor(seatIndex / seatLetters.length) + 1}${seatLetters[seatIndex % seatLetters.length]}`;
                    seatDetailsValues.push([
                        crypto.randomUUID(),
                        newFlightId,
                        row.travel_class_id,
                        seatNumber,
                    ]);
                    seatIndex++;
                }
            }

            if (seatDetailsValues.length > 0) {
                const insertSeatQuery = `
                    INSERT INTO seat_details (id, flight_id, travel_class_id, seat_number)
                    SELECT unnest($1::uuid[]), unnest($2::uuid[]), unnest($3::uuid[]), unnest($4::text[])
                `;
                const ids = seatDetailsValues.map(r => r[0]);
                const flightIds = seatDetailsValues.map(r => r[1]);
                const travelClassIds = seatDetailsValues.map(r => r[2]);
                const seatNumbers = seatDetailsValues.map(r => r[3]);
                await client.query(insertSeatQuery, [ids, flightIds, travelClassIds, seatNumbers]);

                // Chèn vào flight_costs
                const costValues = seatDetailsValues.map(row => [
                    row[0], // seat_id
                    departureTime, // valid_from_date
                    arrivalTime, // valid_to_date
                    100.00, // Giả định chi phí mặc định
                ]);
                const insertCostQuery = `
                    INSERT INTO flight_costs (seat_id, valid_from_date, valid_to_date, cost)
                    SELECT unnest($1::uuid[]), unnest($2::timestamp[]), unnest($3::timestamp[]), unnest($4::decimal[])
                `;
                await client.query(insertCostQuery, [
                    costValues.map(r => r[0]),
                    costValues.map(r => r[1]),
                    costValues.map(r => r[2]),
                    costValues.map(r => r[3]),
                ]);
            }

            await client.query('COMMIT');
            return this.getFlightById(newFlightId);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error creating flight:', error.message);
            throw new FlightServiceError(`Could not create flight: ${error.message}`, 'CREATE_FLIGHT_FAILED');
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

            // Kiểm tra departure_time < arrival_time
            if (data.departure_time && data.arrival_time && new Date(data.departure_time) >= new Date(data.arrival_time)) {
                throw new FlightServiceError('Departure time must be before arrival time', 'INVALID_TIME');
            }

            // Kiểm tra source_airport_id != destination_airport_id
            if (data.source_airport_id && data.destination_airport_id && data.source_airport_id === data.destination_airport_id) {
                throw new FlightServiceError('Source and destination airports must be different', 'INVALID_AIRPORTS');
            }

            // Kiểm tra khóa ngoại
            if (data.aircraft_id) {
                const aircraftCheck = await client.query('SELECT 1 FROM aircrafts WHERE id = $1', [data.aircraft_id]);
                if (aircraftCheck.rows.length === 0) {
                    throw new FlightServiceError('Invalid aircraft_id', 'INVALID_AIRCRAFT');
                }
            }
            if (data.source_airport_id || data.destination_airport_id) {
                const airportsToCheck = [];
                if (data.source_airport_id) airportsToCheck.push(data.source_airport_id);
                if (data.destination_airport_id) airportsToCheck.push(data.destination_airport_id);
                if (airportsToCheck.length > 0) {
                    const airportCheck = await client.query(
                        'SELECT id FROM airports WHERE id = ANY($1::uuid[])',
                        [airportsToCheck]
                    );
                    if (airportCheck.rows.length !== airportsToCheck.length) {
                        throw new FlightServiceError('Invalid source or destination airport', 'INVALID_AIRPORT');
                    }
                }
            }

            // Chuẩn hóa thời gian
            if (data.departure_time) data.departure_time = new Date(data.departure_time).toISOString();
            if (data.arrival_time) data.arrival_time = new Date(data.arrival_time).toISOString();

            // Build dynamic update query
            const fields = [];
            const values = [];
            let paramIndex = 1;

            const allowedFields = [
                'aircraft_id',
                'source_airport_id',
                'destination_airport_id',
                'departure_time',
                'arrival_time'
            ];

            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    fields.push(`${field} = $${paramIndex++}`);
                    values.push(data[field]);
                }
            });

            if (fields.length === 0) {
                throw new FlightServiceError('No valid fields provided for update', 'NO_FIELDS_TO_UPDATE');
            }

            values.push(id);

            const updateQuery = `
                UPDATE flights
                SET ${fields.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *;
            `;

            const result = await client.query(updateQuery, values);

            if (result.rows.length === 0) {
                throw new FlightServiceError('Flight not found', 'FLIGHT_NOT_FOUND');
            }

            await client.query('COMMIT');
            return this.getFlightById(id);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`❌ Error updating flight ${id}:`, error.message);
            throw new FlightServiceError(`Could not update flight: ${error.message}`, 'UPDATE_FLIGHT_FAILED');
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

            // Kiểm tra departure_time < arrival_time
            if (new Date(newDeparture) >= new Date(newArrival)) {
                throw new FlightServiceError('Departure time must be before arrival time', 'INVALID_TIME');
            }

            // Chuẩn hóa thời gian
            const departureTime = new Date(newDeparture).toISOString();
            const arrivalTime = new Date(newArrival).toISOString();

            // Cập nhật bảng flights
            const updateFlightQuery = `
                UPDATE flights
                SET departure_time = $1,
                    arrival_time = $2
                WHERE id = $3
                RETURNING *;
            `;
            const flightResult = await client.query(updateFlightQuery, [departureTime, arrivalTime, flightId]);
            if (flightResult.rows.length === 0) {
                throw new FlightServiceError('Flight not found', 'FLIGHT_NOT_FOUND');
            }

            await client.query('COMMIT');
            return this.getFlightById(flightId);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`❌ Error delaying flight ${flightId}:`, error.message);
            throw new FlightServiceError(`Could not delay flight: ${error.message}`, 'DELAY_FLIGHT_FAILED');
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

            // Kiểm tra chuyến bay tồn tại
            const flightCheck = await client.query('SELECT 1 FROM flights WHERE id = $1', [flightId]);
            if (flightCheck.rows.length === 0) {
                throw new FlightServiceError('Flight not found', 'FLIGHT_NOT_FOUND');
            }

            // Xóa seat_details và flights
            await client.query('DELETE FROM seat_details WHERE flight_id = $1', [flightId]);
            const flightRes = await client.query('DELETE FROM flights WHERE id = $1 RETURNING *', [flightId]);
            const cancelledFlight = flightRes.rows[0];

            await client.query('COMMIT');
            return cancelledFlight;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`❌ Error cancelling flight ${flightId}:`, error.message);
            throw new FlightServiceError(`Could not cancel flight: ${error.message}`, 'CANCEL_FLIGHT_FAILED');
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

            // Kiểm tra seat_details
            const seatDetailsRef = await client.query(
                'SELECT 1 FROM seat_details WHERE flight_id = $1 LIMIT 1',
                [id]
            );
            if (seatDetailsRef.rows.length) {
                throw new FlightServiceError('Cannot delete: flight has related seat details', 'FLIGHT_HAS_SEATS');
            }

            // Xóa chuyến bay
            const deleteResult = await client.query('DELETE FROM flights WHERE id = $1 RETURNING id', [id]);

            if (deleteResult.rows.length === 0) {
                throw new FlightServiceError('Flight not found', 'FLIGHT_NOT_FOUND');
            }

            await client.query('COMMIT');
            return { deleted: true };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`❌ Error deleting flight ${id}:`, error.message);
            throw new FlightServiceError(`Could not delete flight: ${error.message}`, 'DELETE_FLIGHT_FAILED');
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
                    sd.seat_number,
                    tc.name AS travel_class_name,
                    p.first_name,
                    p.last_name,
                    p.email,
                    p.phone_number
                FROM seat_details sd
                JOIN travel_classes tc ON sd.travel_class_id = tc.id
                LEFT JOIN reservations r ON sd.id = r.seat_id
                LEFT JOIN passengers p ON r.passenger_id = p.id
                WHERE sd.flight_id = $1;
            `;
            const result = await db.query(query, [flightId]);
            return result.rows;
        } catch (error) {
            console.error(`❌ Error fetching passengers for flight ${flightId}:`, error.message);
            throw new FlightServiceError(`Could not fetch passengers for flight: ${error.message}`, 'FETCH_PASSENGERS_FAILED');
        }
    }
}

module.exports = new FlightService();