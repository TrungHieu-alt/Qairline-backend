-- +goose Up
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airline_id UUID NOT NULL,
    flight_number TEXT UNIQUE NOT NULL,
    route_id UUID NOT NULL,
    aircraft_id UUID NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    flight_status TEXT NOT NULL DEFAULT 'Scheduled',
    base_first_class_price DECIMAL(10, 2),
    base_business_class_price DECIMAL(10, 2),
    base_economy_class_price DECIMAL(10, 2),
    CONSTRAINT fk_airline FOREIGN KEY (airline_id) REFERENCES airlines(id),
    CONSTRAINT fk_route FOREIGN KEY (route_id) REFERENCES routes(id),
    CONSTRAINT fk_aircraft FOREIGN KEY (aircraft_id) REFERENCES aircrafts(id),
    CONSTRAINT check_status CHECK (flight_status IN ('Scheduled', 'Departed', 'Arrived', 'Cancelled', 'Delayed')),
    CONSTRAINT check_time CHECK (departure_time < arrival_time)
);
CREATE INDEX idx_flight_departure ON flights(departure_time);
CREATE INDEX idx_flight_route ON flights(route_id);

-- Sample Flight Data for QAirline (Robust PostgreSQL version, NO @VARIABLES)

INSERT INTO flights (
    airline_id,
    flight_number,
    route_id,
    aircraft_id,
    departure_time,
    arrival_time,
    flight_status,
    base_first_class_price,
    base_business_class_price,
    base_economy_class_price
) VALUES
-- 1. Domestic: Hanoi (HAN) to Ho Chi Minh City (SGN) - Morning
(
    (SELECT id FROM airlines WHERE code = 'QA'), -- Fetch airline_id
    'QA101',
    (SELECT id FROM routes -- Fetch route_id for HAN -> SGN
     WHERE (SELECT code FROM airports WHERE id = departure_airport_id) = 'HAN'
     AND (SELECT code FROM airports WHERE id = arrival_airport_id) = 'SGN'),
    (SELECT id FROM aircrafts -- Fetch aircraft_id for Airbus A321neo belonging to QA
     WHERE aircraft_type = 'Airbus A321neo' AND airline_id = (SELECT id FROM airlines WHERE code = 'QA')),
    '2025-06-15 07:00:00+07', -- Departure: June 15, 7:00 AM VN time
    '2025-06-15 09:15:00+07', -- Arrival: ~2h 15m later
    'Scheduled',
    250.00,
    180.00,
    100.00
),
-- 2. Domestic: Ho Chi Minh City (SGN) to Hanoi (HAN) - Morning
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'QA102',
    (SELECT id FROM routes
     WHERE (SELECT code FROM airports WHERE id = departure_airport_id) = 'SGN'
     AND (SELECT code FROM airports WHERE id = arrival_airport_id) = 'HAN'),
    (SELECT id FROM aircrafts
     WHERE aircraft_type = 'Airbus A321neo' AND airline_id = (SELECT id FROM airlines WHERE code = 'QA')),
    '2025-06-15 10:30:00+07',
    '2025-06-15 12:45:00+07',
    'Scheduled',
    250.00,
    180.00,
    100.00
),
-- 3. International: Hanoi (HAN) to Singapore (SIN) - Afternoon
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'QA201',
    (SELECT id FROM routes
     WHERE (SELECT code FROM airports WHERE id = departure_airport_id) = 'HAN'
     AND (SELECT code FROM airports WHERE id = arrival_airport_id) = 'SIN'),
    (SELECT id FROM aircrafts
     WHERE aircraft_type = 'Boeing 787-9 Dreamliner' AND airline_id = (SELECT id FROM airlines WHERE code = 'QA')),
    '2025-06-16 14:00:00+07',
    '2025-06-16 17:30:00+08',
    'Scheduled',
    400.00,
    300.00,
    180.00
),
-- 4. International: Singapore (SIN) to Hanoi (HAN) - Evening
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'QA202',
    (SELECT id FROM routes
     WHERE (SELECT code FROM airports WHERE id = departure_airport_id) = 'SIN'
     AND (SELECT code FROM airports WHERE id = arrival_airport_id) = 'HAN'),
    (SELECT id FROM aircrafts
     WHERE aircraft_type = 'Boeing 787-9 Dreamliner' AND airline_id = (SELECT id FROM airlines WHERE code = 'QA')),
    '2025-06-16 19:00:00+08',
    '2025-06-16 22:30:00+07',
    'Scheduled',
    400.00,
    300.00,
    180.00
),
-- 5. Domestic: Ho Chi Minh City (SGN) to Da Nang (DAD) - Evening
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'QA301',
    (SELECT id FROM routes
     WHERE (SELECT code FROM airports WHERE id = departure_airport_id) = 'SGN'
     AND (SELECT code FROM airports WHERE id = arrival_airport_id) = 'DAD'),
    (SELECT id FROM aircrafts
     WHERE aircraft_type = 'Embraer E190' AND airline_id = (SELECT id FROM airlines WHERE code = 'QA')),
    '2025-06-17 19:00:00+07',
    '2025-06-17 20:30:00+07',
    'Scheduled',
    NULL,
    100.00,
    60.00
),
-- 6. Domestic: Da Nang (DAD) to Ho Chi Minh City (SGN) - Morning
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'QA302',
    (SELECT id FROM routes
     WHERE (SELECT code FROM airports WHERE id = departure_airport_id) = 'DAD'
     AND (SELECT code FROM airports WHERE id = arrival_airport_id) = 'SGN'),
    (SELECT id FROM aircrafts
     WHERE aircraft_type = 'Embraer E190' AND airline_id = (SELECT id FROM airlines WHERE code = 'QA')),
    '2025-06-18 08:00:00+07',
    '2025-06-18 09:30:00+07',
    'Scheduled',
    NULL,
    100.00,
    60.00
),
-- 7. International: Da Nang (DAD) to Incheon (ICN) - Night
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'QA401',
    (SELECT id FROM routes
     WHERE (SELECT code FROM airports WHERE id = departure_airport_id) = 'DAD'
     AND (SELECT code FROM airports WHERE id = arrival_airport_id) = 'ICN'),
    (SELECT id FROM aircrafts
     WHERE aircraft_type = 'Boeing 787-9 Dreamliner' AND airline_id = (SELECT id FROM airlines WHERE code = 'QA')),
    '2025-06-19 23:00:00+07',
    '2025-06-20 06:30:00+09',
    'Scheduled',
    500.00,
    380.00,
    220.00
),
-- 8. International: Incheon (ICN) to Da Nang (DAD) - Morning
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'QA402',
    (SELECT id FROM routes
     WHERE (SELECT code FROM airports WHERE id = departure_airport_id) = 'ICN'
     AND (SELECT code FROM airports WHERE id = arrival_airport_id) = 'DAD'),
    (SELECT id FROM aircrafts
     WHERE aircraft_type = 'Boeing 787-9 Dreamliner' AND airline_id = (SELECT id FROM airlines WHERE code = 'QA')),
    '2025-06-20 08:00:00+09',
    '2025-06-20 11:30:00+07',
    'Scheduled',
    500.00,
    380.00,
    220.00
),
-- 9. International: Ho Chi Minh City (SGN) to Bangkok (BKK) - Morning
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'QA501',
    (SELECT id FROM routes
     WHERE (SELECT code FROM airports WHERE id = departure_airport_id) = 'SGN'
     AND (SELECT code FROM airports WHERE id = arrival_airport_id) = 'BKK'),
    (SELECT id FROM aircrafts
     WHERE aircraft_type = 'Airbus A321neo' AND airline_id = (SELECT id FROM airlines WHERE code = 'QA')),
    '2025-06-21 09:00:00+07',
    '2025-06-21 10:30:00+07',
    'Scheduled',
    300.00,
    200.00,
    120.00
),
-- 10. International: Bangkok (BKK) to Ho Chi Minh City (SGN) - Afternoon
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'QA502',
    (SELECT id FROM routes
     WHERE (SELECT code FROM airports WHERE id = departure_airport_id) = 'BKK'
     AND (SELECT code FROM airports WHERE id = arrival_airport_id) = 'SGN'),
    (SELECT id FROM aircrafts
     WHERE aircraft_type = 'Airbus A321neo' AND airline_id = (SELECT id FROM airlines WHERE code = 'QA')),
    '2025-06-21 14:00:00+07',
    '2025-06-21 15:30:00+07',
    'Scheduled',
    300.00,
    200.00,
    120.00
);

-- +goose Down
DROP TABLE flights;
