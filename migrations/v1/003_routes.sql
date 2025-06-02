-- +goose Up
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    departure_airport_id UUID NOT NULL,
    arrival_airport_id UUID NOT NULL,
    distance DECIMAL(10, 2),
    base_price DECIMAL(10, 2),
    CONSTRAINT fk_departure_airport FOREIGN KEY (departure_airport_id) REFERENCES airports(id),
    CONSTRAINT fk_arrival_airport FOREIGN KEY (arrival_airport_id) REFERENCES airports(id),
    CONSTRAINT check_different_airports CHECK (departure_airport_id != arrival_airport_id)
);

-- Sample Route Data for QAirline

-- Route 1: Hanoi (HAN) <-> Ho Chi Minh City (SGN) (Domestic)
INSERT INTO routes (departure_airport_id, arrival_airport_id, distance, base_price) VALUES
(
    (SELECT id FROM airports WHERE code = 'HAN'), -- Departure: Hanoi
    (SELECT id FROM airports WHERE code = 'SGN'), -- Arrival: Ho Chi Minh City
    1190.00, -- Approximately 1190 km
    150.00   -- Base price in USD
);

INSERT INTO routes (departure_airport_id, arrival_airport_id, distance, base_price) VALUES
(
    (SELECT id FROM airports WHERE code = 'SGN'), -- Departure: Ho Chi Minh City
    (SELECT id FROM airports WHERE code = 'HAN'), -- Arrival: Hanoi
    1190.00, -- Approximately 1190 km
    150.00   -- Base price in USD
);

---

-- Route 2: Hanoi (HAN) <-> Singapore (SIN) (International)
INSERT INTO routes (departure_airport_id, arrival_airport_id, distance, base_price) VALUES
(
    (SELECT id FROM airports WHERE code = 'HAN'), -- Departure: Hanoi
    (SELECT id FROM airports WHERE code = 'SIN'), -- Arrival: Singapore
    2200.00, -- Approximately 2200 km
    250.00   -- Base price in USD
);

INSERT INTO routes (departure_airport_id, arrival_airport_id, distance, base_price) VALUES
(
    (SELECT id FROM airports WHERE code = 'SIN'), -- Departure: Singapore
    (SELECT id FROM airports WHERE code = 'HAN'), -- Arrival: Hanoi
    2200.00, -- Approximately 2200 km
    250.00   -- Base price in USD
);

---

-- Route 3: Ho Chi Minh City (SGN) <-> Da Nang (DAD) (Domestic)
INSERT INTO routes (departure_airport_id, arrival_airport_id, distance, base_price) VALUES
(
    (SELECT id FROM airports WHERE code = 'SGN'), -- Departure: Ho Chi Minh City
    (SELECT id FROM airports WHERE code = 'DAD'), -- Arrival: Da Nang
    610.00, -- Approximately 610 km
    80.00   -- Base price in USD
);

INSERT INTO routes (departure_airport_id, arrival_airport_id, distance, base_price) VALUES
(
    (SELECT id FROM airports WHERE code = 'DAD'), -- Departure: Da Nang
    (SELECT id FROM airports WHERE code = 'SGN'), -- Arrival: Ho Chi Minh City
    610.00, -- Approximately 610 km
    80.00   -- Base price in USD
);

---

-- Route 4: Da Nang (DAD) <-> Incheon (ICN) (International)
INSERT INTO routes (departure_airport_id, arrival_airport_id, distance, base_price) VALUES
(
    (SELECT id FROM airports WHERE code = 'DAD'), -- Departure: Da Nang
    (SELECT id FROM airports WHERE code = 'ICN'), -- Arrival: Incheon
    3200.00, -- Approximately 3200 km
    350.00   -- Base price in USD
);

INSERT INTO routes (departure_airport_id, arrival_airport_id, distance, base_price) VALUES
(
    (SELECT id FROM airports WHERE code = 'ICN'), -- Departure: Incheon
    (SELECT id FROM airports WHERE code = 'DAD'), -- Arrival: Da Nang
    3200.00, -- Approximately 3200 km
    350.00   -- Base price in USD
);

---

-- Route 5: Ho Chi Minh City (SGN) <-> Bangkok (BKK) (International)
INSERT INTO routes (departure_airport_id, arrival_airport_id, distance, base_price) VALUES
(
    (SELECT id FROM airports WHERE code = 'SGN'), -- Departure: Ho Chi Minh City
    (SELECT id FROM airports WHERE code = 'BKK'), -- Arrival: Bangkok
    750.00, -- Approximately 750 km
    120.00   -- Base price in USD
);

INSERT INTO routes (departure_airport_id, arrival_airport_id, distance, base_price) VALUES
(
    (SELECT id FROM airports WHERE code = 'BKK'), -- Departure: Bangkok
    (SELECT id FROM airports WHERE code = 'SGN'), -- Arrival: Ho Chi Minh City
    750.00, -- Approximately 750 km
    120.00   -- Base price in USD
);


-- +goose Down
DROP TABLE routes;
