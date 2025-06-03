-- +goose Up
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

-- +goose Down
DROP TABLE flights;