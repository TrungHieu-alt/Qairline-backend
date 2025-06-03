-- +goose Up
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL,
    seat_id UUID NOT NULL,
    reservation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_passenger
        FOREIGN KEY (passenger_id)
        REFERENCES passengers (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_seat
        FOREIGN KEY (seat_id)
        REFERENCES seat_details (id)
        ON DELETE CASCADE,
    CONSTRAINT unique_seat_reservation UNIQUE (seat_id)
);

-- +goose Down
DROP TABLE reservations; 