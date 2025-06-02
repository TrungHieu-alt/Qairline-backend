-- +goose Up
CREATE TABLE aircrafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airline_id UUID NOT NULL,
    aircraft_type TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    CONSTRAINT fk_airline
        FOREIGN KEY (airline_id)
        REFERENCES airlines (id)
        ON DELETE CASCADE,
    total_seats INT NOT NULL,
);

INSERT INTO aircrafts (airline_id, aircraft_type, registration_number, total_seats)
VALUES
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'Airbus A320',
    'VQ-BKA',
    150
),
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'Airbus A320',
    'VQ-BKB',
    150
),
(
    (SELECT id FROM airlines WHERE code = 'QA'),
    'Airbus A321',
    'VQ-BKC',
    180
);

-- +goose Down
DROP TABLE aircrafts;