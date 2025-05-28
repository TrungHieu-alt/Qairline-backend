-- +goose Up

-- Airlines
INSERT INTO airlines (id, name, code) VALUES
('11111111-1111-1111-1111-111111111111', 'TestAir', 'TA'),
('22222222-2222-2222-2222-222222222222', 'FlyNow', 'FN');

-- Airports
INSERT INTO airports (id, name, code, city, country) VALUES
('33333333-3333-3333-3333-333333333333', 'Test International Airport', 'TIA', 'Test City', 'Testland'),
('44444444-4444-4444-4444-444444444444', 'Nowhere Airport', 'NWA', 'Nowhere', 'Neverland');

-- Routes
INSERT INTO routes (id, departure_airport_id, arrival_airport_id, distance, base_price) VALUES
('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 1500, 120.00);

-- Aircrafts
INSERT INTO aircrafts (id, airline_id, aircraft_type, total_first_class_seats, total_business_class_seats, total_economy_class_seats, aircraft_code, manufacturer) VALUES
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'A320', 10, 20, 100, 'TA-A320', 'Airbus');

-- Flights
INSERT INTO flights (id, airline_id, flight_number, route_id, aircraft_id, departure_time, arrival_time, flight_status, base_first_class_price, base_business_class_price, base_economy_class_price) VALUES
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'TA100', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', NOW() + INTERVAL '1 day', NOW() + INTERVAL '2 day', 'Scheduled', 300.0, 200.0, 100.0);

-- Ticket Classes
INSERT INTO ticket_classes (id, class_name, coefficient) VALUES
('88888888-8888-8888-8888-888888888888', 'First Class', 2.0),
('99999999-9999-9999-9999-999999999999', 'Business Class', 1.5),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Economy Class', 1.0);

-- Customers
INSERT INTO customers (id, first_name, last_name, birth_date, gender, identity_number, phone_number, email, address, country) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Alice', 'Test', '1990-01-01', 'Female', 'ID001', '0909000900', 'alice@test.com', 'Test Street', 'Testland'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bob', 'Nowhere', '1985-06-15', 'Male', 'ID002', '0909111222', 'bob@nowhere.com', 'Nowhere Street', 'Neverland');

-- Employees
INSERT INTO employees (id, first_name, last_name, email, password_hash, role) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Admin', 'User', 'admin@test.com', '$2b$10$testtesttesttesttesttesttesttesttesttesttest', 'Admin');

-- Announcements
INSERT INTO announcements (id, title, content, type, expiry_date, created_by) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'System Maintenance', 'We will be down at midnight.', 'Notice', NOW() + INTERVAL '7 days', 'dddddddd-dddd-dddd-dddd-dddddddddddd');

-- Tickets
INSERT INTO tickets (id, flight_id, customer_id, ticket_class_id, seat_number, price, booking_date, ticket_status, ticket_code, cancellation_deadline) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', '77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '88888888-8888-8888-8888-888888888888', '1A', 300.00, NOW(), 'Confirmed', gen_random_uuid(), NOW() + INTERVAL '1 day'),
('11111111-1111-1111-2222-111111111111', '77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '88888888-8888-8888-8888-888888888888', '1B', 300.00, NOW(), 'Confirmed', gen_random_uuid(), NOW() + INTERVAL '1 day'),
('22222222-2222-2222-3333-222222222222', '77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '88888888-8888-8888-8888-888888888888', '1C', 300.00, NOW(), 'Confirmed', gen_random_uuid(), NOW() + INTERVAL '1 day');

-- +goose Down
DELETE FROM tickets;
DELETE FROM announcements;
DELETE FROM employees;
DELETE FROM customers;
DELETE FROM ticket_classes;
DELETE FROM flights;
DELETE FROM aircrafts;
DELETE FROM routes;
DELETE FROM airports;
DELETE FROM airlines;