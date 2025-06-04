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
                    f.airline_id,
                    f.flight_number,
                    f.aircraft_id,
                    f.source_airport_id,
                    f.destination_airport_id,
                    f.departure_time,
                    f.arrival_time,
                    f.flight_status,
                    a.name AS airline_name,
                    ac.aircraft_code AS aircraft_type, -- Assuming aircraft_code in aircrafts V2
                    s_ap.name AS source_airport_name,
                    s_ap.code AS source_airport_code,
                    d_ap.name AS destination_airport_name,
                    d_ap.code AS destination_airport_code
                FROM flights f
                JOIN airlines a ON f.airline_id = a.id
                JOIN aircrafts ac ON f.aircraft_id = ac.id -- Assuming aircrafts table in V2
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
                    f.*, -- Select all columns from flights
                    a.name AS airline_name,
                    ac.aircraft_code AS aircraft_type, -- Assuming aircraft_code in aircrafts V2
                    s_ap.name AS source_airport_name,
                    s_ap.code AS source_airport_code,
                    d_ap.name AS destination_airport_name,
                    d_ap.code AS destination_airport_code
                FROM flights f
                JOIN airlines a ON f.airline_id = a.id
                JOIN aircrafts ac ON f.aircraft_id = ac.id -- Assuming aircrafts table in V2
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
                    f.flight_number,
                    f.departure_time,
                    f.arrival_time,
                    a.name AS airline_name,
                    ac.aircraft_code AS aircraft_type, -- Assuming aircraft_code in aircrafts V2
                    s_ap.name AS source_airport_name,
                    d_ap.name AS destination_airport_name
                FROM flights f
                JOIN airlines a ON f.airline_id = a.id
                JOIN aircrafts ac ON f.aircraft_id = ac.id -- Assuming aircrafts table in V2
                JOIN airports s_ap ON f.source_airport_id = s_ap.id
                JOIN airports d_ap ON f.destination_airport_id = d_ap.id
                WHERE f.source_airport_id = $1
                  AND f.destination_airport_id = $2
                  AND DATE(f.departure_time) = $3
                  AND f.flight_status <> 'Cancelled' -- Exclude cancelled flights
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
     * @param {Object} data - airline_id, flight_number, aircraft_id, source_airport_id, destination_airport_id, departure_time, arrival_time, flight_status.
     * @returns {Promise<Object>} The created flight.
     */
    async createFlight(data) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Insert into flights table
            const insertFlightQuery = `
                INSERT INTO flights (
                    id, airline_id, flight_number, aircraft_id, source_airport_id, destination_airport_id,
                    departure_time, arrival_time, flight_status, created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
                RETURNING id, aircraft_id; -- Return flight_id and aircraft_id
            `;
            const newFlightId = crypto.randomUUID(); // Generate UUID for new flight
            const flightValues = [
                newFlightId,
                data.airline_id,
                data.flight_number,
                data.aircraft_id,
                data.source_airport_id,
                data.destination_airport_id,
                data.departure_time,
                data.arrival_time,
                data.flight_status || 'Scheduled', // Default status
            ];
            const flightResult = await client.query(insertFlightQuery, flightValues);
            const newFlight = flightResult.rows[0];
            const aircraftId = newFlight.aircraft_id;


            // 2. Get seat layout from aircraft_types
            // Need to JOIN aircrafts with aircraft_types to get seat info
            const getSeatLayoutQuery = `
                 SELECT
                     at.economy_seats,
                     at.business_seats,
                     at.first_class_seats,
                     at.premium_economy_seats -- Assuming premium_economy_seats in aircraft_types V2
                 FROM aircrafts a
                 JOIN aircraft_types at ON a.aircraft_type_id = at.id
                 WHERE a.id = $1;
            `;
            const seatLayoutResult = await client.query(getSeatLayoutQuery, [aircraftId]);
            if (seatLayoutResult.rows.length === 0) {
                throw new Error('Aircraft type not found for selected aircraft');
            }
            const seatLayout = seatLayoutResult.rows[0];


            // 3. Insert into seat_details for each seat
            const insertSeatDetailsQuery = `
                 INSERT INTO seat_details (id, flight_id, travel_class_id, seat_number, status, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW());
            `;

            // Assuming you have a way to map class names ('Economy', 'Business', etc.) to travel_class_ids
            // You might need to fetch these from the travel_classes table once during application startup or dynamically
            // For now, let's assume you have a mapping or can query
            const getTravelClassIdsQuery = `
                 SELECT id, name FROM travel_classes WHERE name IN ('Economy', 'Business', 'First Class', 'Premium Economy');
            `;
            const travelClassesResult = await client.query(getTravelClassIdsQuery);
            const travelClassMap = travelClassesResult.rows.reduce((map, tc) => {
                 map[tc.name] = tc.id;
                 return map;
            }, {});

            let seatCounter = 1;
            const seatDetailsValues = [];

            // Economy seats
            const economyClassId = travelClassMap['Economy'];
            if (seatLayout.economy_seats > 0 && economyClassId) {
                 seatCounter = 1; // Reset counter for each class for distinct numbering or combine counters
                 for (let i = 0; i < seatLayout.economy_seats; i++) {
                      seatDetailsValues.push([
                         crypto.randomUUID(), // Generate UUID for seat_detail
                         newFlightId,
                         economyClassId,
                         `E${seatCounter++}`, // Example seat numbering (E1, E2, ...)
                         'Available',
                      ]);
                 }
             }


            // Business seats
             const businessClassId = travelClassMap['Business'];
             if (seatLayout.business_seats > 0 && businessClassId) {
                 seatCounter = 1; // Reset counter
                 for (let i = 0; i < seatLayout.business_seats; i++) {
                     seatDetailsValues.push([
                        crypto.randomUUID(),
                        newFlightId,
                        businessClassId,
                         `B${seatCounter++}`, // Example seat numbering (B1, B2, ...)
                        'Available',
                     ]);
                 }
             }

             // First Class seats
             const firstClassId = travelClassMap['First Class'];
             if (seatLayout.first_class_seats > 0 && firstClassId) {
                 seatCounter = 1; // Reset counter
                 for (let i = 0; i < seatLayout.first_class_seats; i++) {
                     seatDetailsValues.push([
                        crypto.randomUUID(),
                        newFlightId,
                        firstClassId,
                         `F${seatCounter++}`, // Example seat numbering (F1, F2, ...)
                        'Available',
                     ]);
                 }
             }

             // Premium Economy seats
             const premiumEconomyClassId = travelClassMap['Premium Economy'];
             if (seatLayout.premium_economy_seats > 0 && premiumEconomyClassId) {
                  seatCounter = 1; // Reset counter
                  for (let i = 0; i < seatLayout.premium_economy_seats; i++) {
                      seatDetailsValues.push([
                         crypto.randomUUID(),
                         newFlightId,
                         premiumEconomyClassId,
                          `P${seatCounter++}`, // Example seat numbering (P1, P2, ...)
                         'Available',
                      ]);
                  }
              }


            // Use unnest for bulk insert (more efficient)
             if (seatDetailsValues.length > 0) {
                  const unnestQuery = `
                      INSERT INTO seat_details (id, flight_id, travel_class_id, seat_number, status, created_at, updated_at)
                      SELECT unnest($1::uuid[]), unnest($2::uuid[]), unnest($3::uuid[]), unnest($4::text[]), unnest($5::seat_status[]), NOW(), NOW();
                  `;
                  const unnestValues = [
                      seatDetailsValues.map(row => row[0]), // ids
                      seatDetailsValues.map(row => row[1]), // flight_ids (all same newFlightId)
                      seatDetailsValues.map(row => row[2]), // travel_class_ids
                      seatDetailsValues.map(row => row[3]), // seat_numbers
                      seatDetailsValues.map(row => row[4]), // statuses (all 'Available')
                  ];
                  await client.query(unnestQuery, unnestValues);
              }


            // 4. Insert into flight_costs for each travel class
            // Need to get default prices for each class - maybe from aircraft_types or a separate config?
            // For now, let's assume base prices are provided in data or default to 0
            const insertFlightCostsQuery = `
                 INSERT INTO flight_costs (id, flight_id, travel_class_id, base_price, effective_from, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, NOW(), NOW());
            `;
            const flightCostsValues = [];
            // Assuming base prices are provided in data object, e.g., data.basePrices = { 'Economy': 100, 'Business': 200, ... }
            const basePrices = data.basePrices || {};


             if (economyClassId) {
                 flightCostsValues.push([crypto.randomUUID(), newFlightId, economyClassId, basePrices['Economy'] || 0]);
             }
             if (businessClassId) {
                  flightCostsValues.push([crypto.randomUUID(), newFlightId, businessClassId, basePrices['Business'] || 0]);
              }
              if (firstClassId) {
                  flightCostsValues.push([crypto.randomUUID(), newFlightId, firstClassId, basePrices['First Class'] || 0]);
               }
              if (premiumEconomyClassId) {
                  flightCostsValues.push([crypto.randomUUID(), newFlightId, premiumEconomyClassId, basePrices['Premium Economy'] || 0]);
               }


            if (flightCostsValues.length > 0) {
                 const unnestCostsQuery = `
                     INSERT INTO flight_costs (id, flight_id, travel_class_id, base_price, effective_from, created_at, updated_at)
                     SELECT unnest($1::uuid[]), unnest($2::uuid[]), unnest($3::uuid[]), unnest($4::numeric[]), NOW(), NOW();
                 `;
                 const unnestCostsValues = [
                     flightCostsValues.map(row => row[0]), // ids
                     flightCostsValues.map(row => row[1]), // flight_ids (all same newFlightId)
                     flightCostsValues.map(row => row[2]), // travel_class_ids
                     flightCostsValues.map(row => row[3]), // base_prices
                 ];
                 await client.query(unnestCostsQuery, unnestCostsValues);
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
             'airline_id', 'flight_number', 'aircraft_id',
             'source_airport_id', 'destination_airport_id',
             'departure_time', 'arrival_time', 'flight_status'
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
               SET ${fields.join(', ')}, updated_at = NOW()
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
                    arrival_time = $2,
                    flight_status = 'Delayed',
                    updated_at = NOW()
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

            // 1. Đổi trạng thái chuyến bay
            const flightRes = await client.query(
                `UPDATE flights
                 SET flight_status = 'Cancelled', updated_at = NOW()
                 WHERE id = $1
                 RETURNING *`,
                [flightId]
            );
            if (flightRes.rows.length === 0) throw new Error('Flight not found');
            const cancelledFlight = flightRes.rows[0];


            // 2. Hủy các đặt chỗ/chỗ ngồi liên quan
            // In V2, need to update status in reservations or seat_details.
            // Which table to update depends on where the 'cancelled' status for a booking lives.
            // Assuming status update on seat_details to 'Cancelled' and maybe update reservation status if all seats are cancelled.
            const cancelSeatDetailsQuery = `
                 UPDATE seat_details
                 SET status = 'Cancelled', updated_at = NOW()
                 WHERE flight_id = $1 AND status <> 'Cancelled'; -- Only cancel if not already cancelled
            `;
            await client.query(cancelSeatDetailsQuery, [flightId]);


            await client.query('COMMIT');
            return this.getFlightById(flightId); // Return updated flight with full details
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

            // Check for related flight_costs (optional, could cascade on delete)
             const flightCostsRef = await client.query(
                 'SELECT 1 FROM flight_costs WHERE flight_id = $1 LIMIT 1',
                 [id]
             );
            if (flightCostsRef.rows.length) {
                // Depending on foreign key constraints, you might need to delete flight_costs first
                // Or if CASCADE is set, this check is just informative
                 console.warn(`Warning: Flight ${id} has related flight_costs records.`);
                 // Option 1: Delete related costs if not cascaded
                 // await client.query('DELETE FROM flight_costs WHERE flight_id = $1', [id]);
                 // Option 2: Trust CASCADE or enforce check
                 // throw new Error('Cannot delete: flight has related flight_costs');
                 // Assuming cascade delete is NOT set, we'll delete costs first
                 await client.query('DELETE FROM flight_costs WHERE flight_id = $1', [id]);
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
                    p.id AS passenger_id,
                    p.first_name,
                    p.last_name,
                    p.email,
                    p.identity_number,
                    sd.id AS seat_detail_id,
                    sd.seat_number,
                    tc.name AS travel_class_name,
                    sd.status AS seat_status,
                    r.reservation_code -- Optional: include reservation code
                FROM seat_details sd
                JOIN passengers p ON sd.passenger_id = p.id
                JOIN travel_classes tc ON sd.travel_class_id = tc.id
                JOIN reservations r ON sd.reservation_id = r.id -- Assuming seat_details links to reservations
                WHERE sd.flight_id = $1 AND sd.status <> 'Available'; -- Only get booked/cancelled seats
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
