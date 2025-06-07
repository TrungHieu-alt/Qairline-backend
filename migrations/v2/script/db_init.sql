CREATE TABLE airlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'QAirline',
    code TEXT UNIQUE NOT NULL DEFAULT 'QA',
    CONSTRAINT check_code_length CHECK (LENGTH(code) >= 2)
);

INSERT INTO airlines (name, code)
VALUES
('QAirline', 'QA');

CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL
);

INSERT INTO countries (name, code) 
VALUES 
('Vietnam', 'VN'),
('Singapore', 'SG'),
('Thailand', 'TH'),
('South Korea', 'KR'),
('Japan', 'JP'),
('China', 'CN');

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    country_id UUID NOT NULL,
    CONSTRAINT fk_country
        FOREIGN KEY (country_id)
        REFERENCES countries (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_city_country UNIQUE (name, country_id)
);

INSERT INTO cities (name, country_id) 
VALUES 
('Hanoi', (SELECT id FROM countries WHERE code = 'VN')),
('Ho Chi Minh City', (SELECT id FROM countries WHERE code = 'VN')),
('Da Nang', (SELECT id FROM countries WHERE code = 'VN')),
('Nha Trang', (SELECT id FROM countries WHERE code = 'VN')),
('Phu Quoc', (SELECT id FROM countries WHERE code = 'VN')),
('Can Tho', (SELECT id FROM countries WHERE code = 'VN')),
('Vinh', (SELECT id FROM countries WHERE code = 'VN')),
('Hai Phong', (SELECT id FROM countries WHERE code = 'VN')),
('Quang Nam', (SELECT id FROM countries WHERE code = 'VN')),
('Hue', (SELECT id FROM countries WHERE code = 'VN')),
('Buon Ma Thuot', (SELECT id FROM countries WHERE code = 'VN')),
('Da Lat', (SELECT id FROM countries WHERE code = 'VN')),
('Pleiku', (SELECT id FROM countries WHERE code = 'VN')),
('Quy Nhon', (SELECT id FROM countries WHERE code = 'VN')),
('Dong Hoi', (SELECT id FROM countries WHERE code = 'VN')),
('Thanh Hoa', (SELECT id FROM countries WHERE code = 'VN')),
('Con Dao', (SELECT id FROM countries WHERE code = 'VN')),
('Rach Gia', (SELECT id FROM countries WHERE code = 'VN')),
('Dien Bien Phu', (SELECT id FROM countries WHERE code = 'VN')),
('Tuy Hoa', (SELECT id FROM countries WHERE code = 'VN')),
('Ca Mau', (SELECT id FROM countries WHERE code = 'VN')),

('Singapore', (SELECT id FROM countries WHERE code = 'SG')),
('Bangkok', (SELECT id FROM countries WHERE code = 'TH')),
('Seoul', (SELECT id FROM countries WHERE code = 'KR')),
('Tokyo', (SELECT id FROM countries WHERE code = 'JP')),
('Beijing', (SELECT id FROM countries WHERE code = 'CN'));

CREATE TABLE airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    city_id UUID NOT NULL,
    CONSTRAINT fk_city
        FOREIGN KEY (city_id)
        REFERENCES cities (id)
        ON DELETE CASCADE,
    CONSTRAINT check_airport_code CHECK (LENGTH(code) = 3)
);

INSERT INTO airports (name, code, city_id)
VALUES
('Noi Bai International Airport', 'HAN', (SELECT id FROM cities WHERE name = 'Hanoi')),
('Tan Son Nhat International Airport', 'SGN', (SELECT id FROM cities WHERE name = 'Ho Chi Minh City')),
('Da Nang International Airport', 'DAD', (SELECT id FROM cities WHERE name = 'Da Nang')),
('Cam Ranh International Airport', 'CXR', (SELECT id FROM cities WHERE name = 'Nha Trang')),
('Phu Quoc International Airport', 'PQC', (SELECT id FROM cities WHERE name = 'Phu Quoc')),
('Can Tho International Airport', 'VCA', (SELECT id FROM cities WHERE name = 'Can Tho')),
('Vinh International Airport', 'VII', (SELECT id FROM cities WHERE name = 'Vinh')),
('Cat Bi International Airport', 'HPH', (SELECT id FROM cities WHERE name = 'Hai Phong')),
('Chu Lai International Airport', 'VCL', (SELECT id FROM cities WHERE name = 'Quang Nam')),
('Phu Bai International Airport', 'HUI', (SELECT id FROM cities WHERE name = 'Hue')),
('Buon Ma Thuot Airport', 'BMV', (SELECT id FROM cities WHERE name = 'Buon Ma Thuot')),
('Lien Khuong Airport', 'DLI', (SELECT id FROM cities WHERE name = 'Da Lat')),
('Pleiku Airport', 'PXU', (SELECT id FROM cities WHERE name = 'Pleiku')),
('Phu Cat Airport', 'UIH', (SELECT id FROM cities WHERE name = 'Quy Nhon')),
('Dong Hoi Airport', 'VDH', (SELECT id FROM cities WHERE name = 'Dong Hoi')),
('Tho Xuan Airport', 'THD', (SELECT id FROM cities WHERE name = 'Thanh Hoa')),
('Con Dao Airport', 'VCS', (SELECT id FROM cities WHERE name = 'Con Dao')),
('Rach Gia Airport', 'VKG', (SELECT id FROM cities WHERE name = 'Rach Gia')),
('Dien Bien Phu Airport', 'DIN', (SELECT id FROM cities WHERE name = 'Dien Bien Phu')),
('Tuy Hoa Airport', 'TBB', (SELECT id FROM cities WHERE name = 'Tuy Hoa')),
('Ca Mau Airport', 'CAH', (SELECT id FROM cities WHERE name = 'Ca Mau')),

('Changi Airport', 'SIN', (SELECT id FROM cities WHERE name = 'Singapore')),
('Suvarnabhumi Airport', 'BKK', (SELECT id FROM cities WHERE name = 'Bangkok')),
('Incheon International Airport', 'ICN', (SELECT id FROM cities WHERE name = 'Seoul')),
('Tokyo Haneda Airport', 'HND', (SELECT id FROM cities WHERE name = 'Tokyo')),
('Beijing Capital International Airport', 'PEK', (SELECT id FROM cities WHERE name = 'Beijing'));

CREATE TABLE travel_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO travel_classes (name, description)
VALUES
('Economy', 'Economy class is the most affordable travel class.'),
('Business', 'Business class is the most comfortable travel class.'),
('First', 'First class is the most luxurious travel class.');

CREATE TABLE aircraft_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    total_seats INT NOT NULL
);

INSERT INTO aircraft_types (name, total_seats)
VALUES
(
    'Airbus A320',
    180
),
(
    'Airbus A321',
    150
);

CREATE TABLE aircrafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airline_id UUID NOT NULL,
    aircraft_type_id UUID NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    CONSTRAINT fk_airline
        FOREIGN KEY (airline_id)
        REFERENCES airlines (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_aircraft_type
        FOREIGN KEY (aircraft_type_id)
        REFERENCES aircraft_types (id)
        ON DELETE CASCADE
);

INSERT INTO aircrafts (airline_id, aircraft_type_id, registration_number)
VALUES
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A320'),
    'VQ-BKA'
),
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A320'),
    'VQ-BKB'
),
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A321'),
    'VQ-BKC'
);

CREATE TABLE aircraft_seat_layout (
    aircraft_type_id UUID NOT NULL,
    travel_class_id UUID NOT NULL,
    capacity INT NOT NULL CONSTRAINT capacity_check CHECK (capacity >= 0),
    CONSTRAINT aircraft_type_configuration_pk PRIMARY KEY (aircraft_type_id, travel_class_id),
    CONSTRAINT aircraft_type_configuration_aircraft_type_fk
        FOREIGN KEY (aircraft_type_id) REFERENCES aircraft_types (id),
    CONSTRAINT aircraft_type_configuration_travel_class_fk
        FOREIGN KEY (travel_class_id) REFERENCES travel_classes (id)
);

-- Airbus A320 seat layout
INSERT INTO aircraft_seat_layout (aircraft_type_id, travel_class_id, capacity)
VALUES
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A320'),
    (SELECT id FROM travel_classes WHERE name = 'Economy'),
    100
),
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A320'),
    (SELECT id FROM travel_classes WHERE name = 'Business'),
    50
),
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A320'),
    (SELECT id FROM travel_classes WHERE name = 'First'),
    30
);

-- Airbus A321 seat layout
INSERT INTO aircraft_seat_layout (aircraft_type_id, travel_class_id, capacity)
VALUES
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A321'),
    (SELECT id FROM travel_classes WHERE name = 'Economy'),
    100
),
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A321'),
    (SELECT id FROM travel_classes WHERE name = 'Business'),
    30
),
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A321'),
    (SELECT id FROM travel_classes WHERE name = 'First'),
    20
);

CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_airport_id UUID NOT NULL,
    destination_airport_id UUID NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    aircraft_id UUID NOT NULL,
    CONSTRAINT fk_source_airport
        FOREIGN KEY (source_airport_id)
        REFERENCES airports (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_destination_airport
        FOREIGN KEY (destination_airport_id)
        REFERENCES airports (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_aircraft
        FOREIGN KEY (aircraft_id)
        REFERENCES aircrafts (id)
        ON DELETE CASCADE,
    CONSTRAINT check_departure_time_before_arrival_time CHECK (departure_time < arrival_time),
    CONSTRAINT check_source_and_destination_airports_different CHECK (source_airport_id != destination_airport_id)
);

INSERT INTO flights (source_airport_id, destination_airport_id, departure_time, arrival_time, aircraft_id)
VALUES
(
    (SELECT id FROM airports WHERE code = 'HAN'),
    (SELECT id FROM airports WHERE code = 'SGN'),
    '2025-01-01 08:00:00',
    '2025-01-01 10:00:00',
    (SELECT id FROM aircrafts WHERE registration_number = 'VQ-BKA')
),
(
    (SELECT id FROM airports WHERE code = 'HAN'),
    (SELECT id FROM airports WHERE code = 'SGN'),
    '2025-01-01 10:00:00',
    '2025-01-01 12:00:00',
    (SELECT id FROM aircrafts WHERE registration_number = 'VQ-BKB')
),
(
    (SELECT id FROM airports WHERE code = 'HAN'),
    (SELECT id FROM airports WHERE code = 'SGN'),
    '2025-01-01 12:00:00',
    '2025-01-01 14:00:00',
    (SELECT id FROM aircrafts WHERE registration_number = 'VQ-BKC')
),
(
    (SELECT id FROM airports WHERE code = 'HAN'),
    (SELECT id FROM airports WHERE code = 'SGN'),
    '2025-01-02 14:00:00',
    '2025-01-02 16:00:00',
    (SELECT id FROM aircrafts WHERE registration_number = 'VQ-BKC')
),
(
    (SELECT id FROM airports WHERE code = 'HAN'),
    (SELECT id FROM airports WHERE code = 'SGN'),
    '2025-01-03 16:00:00',
    '2025-01-03 18:00:00',
    (SELECT id FROM aircrafts WHERE registration_number = 'VQ-BKC')
),
(
    (SELECT id FROM airports WHERE code = 'HAN'),
    (SELECT id FROM airports WHERE code = 'SGN'),
    '2025-01-04 18:00:00',
    '2025-01-04 20:00:00',
    (SELECT id FROM aircrafts WHERE registration_number = 'VQ-BKC')
),
(
    (SELECT id FROM airports WHERE code = 'HAN'),
    (SELECT id FROM airports WHERE code = 'SGN'),
    '2025-01-03 20:00:00',
    '2025-01-03 22:00:00',
    (SELECT id FROM aircrafts WHERE registration_number = 'VQ-BKB')
);

CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aircraft_id UUID NOT NULL,
    seat_number TEXT NOT NULL,
    travel_class_id UUID NOT NULL,
    CONSTRAINT fk_aircraft
        FOREIGN KEY (aircraft_id)
        REFERENCES aircrafts (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_travel_class
        FOREIGN KEY (travel_class_id)
        REFERENCES travel_classes (id)
        ON DELETE CASCADE,
    CONSTRAINT unique_seat_per_aircraft UNIQUE (aircraft_id, seat_number)
);


--
-- Dumping data for table `admins`
--
BEGIN;
LOCK TABLE users IN ACCESS EXCLUSIVE MODE;
INSERT INTO users (email, password_hash, role)
VALUES
  (admin@test.com, '$2b$10$GsDJ99Feu/vsIDmvI.cAyuL0TsEjcC8RtSa0rcoqK789fjUAG1tZy', 'admin'),
COMMIT;
