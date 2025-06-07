-- +goose Up
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL,
    seat_id UUID NOT NULL,
    reservation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    flight_id UUID NOT NULL,
    CONSTRAINT fk_passenger
        FOREIGN KEY (passenger_id)
        REFERENCES passengers (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_seat
        FOREIGN KEY (seat_id)
        REFERENCES seats (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_flight
        FOREIGN KEY (flight_id)
        REFERENCES flights (id)
        ON DELETE CASCADE,
    CONSTRAINT unique_seat_per_flight UNIQUE (flight_id, seat_id)
);

-- +goose Down
DROP TABLE reservations; 