-- +goose Up
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

-- +goose Down
DROP TABLE aircrafts;