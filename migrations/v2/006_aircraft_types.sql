-- +goose Up
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

-- +goose Down
DROP TABLE aircraft_types;