-- +goose Up
CREATE TABLE aircrafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airline_id UUID NOT NULL,
    aircraft_type TEXT NOT NULL,
    total_first_class_seats INT NOT NULL,
    total_business_class_seats INT NOT NULL,
    total_economy_class_seats INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    CONSTRAINT fk_airline FOREIGN KEY (airline_id) REFERENCES airlines(id),
    CONSTRAINT check_status CHECK (status IN ('Active', 'Maintenance', 'Retired')),
    CONSTRAINT check_seats_positive CHECK (total_first_class_seats >= 0 AND total_business_class_seats >= 0 AND total_economy_class_seats >= 0)
);

-- Sample Aircraft Data for 'QA' Airline

INSERT INTO aircrafts (airline_id, aircraft_type, total_first_class_seats, total_business_class_seats, total_economy_class_seats, status) VALUES
(
    (SELECT id FROM airlines WHERE code = 'QA'), -- Assuming 'QA' is the airline code
    'Boeing 787-9 Dreamliner', -- Aircraft Type 1
    20,                         -- First Class Seats
    30,                         -- Business Class Seats
    220,                        -- Economy Class Seats
    'Active'                    -- Status
),
(
    (SELECT id FROM airlines WHERE code = 'QA'), -- Assuming 'QA' is the airline code
    'Airbus A321neo',          -- Aircraft Type 2
    10,                         -- First Class Seats
    20,                         -- Business Class Seats
    150,                        -- Economy Class Seats
    'Active'                    -- Status
),
(
    (SELECT id FROM airlines WHERE code = 'QA'), -- Assuming 'QA' is the airline code
    'Embraer E190',            -- Aircraft Type 3
    0,                          -- First Class Seats (smaller aircraft might not have)
    10,                         -- Business Class Seats
    80,                         -- Economy Class Seats
    'Active'                    -- Status
);

-- +goose Down
DROP TABLE aircrafts;
