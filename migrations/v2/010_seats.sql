-- +goose Up
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

-- +goose Down
DROP TABLE seats;
