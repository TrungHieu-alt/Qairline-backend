-- +goose Up
CREATE TABLE flight_costs (
    seat_id UUID NOT NULL,
    valid_from_date TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT flight_costs_pk PRIMARY KEY (seat_id, valid_from_date),
    CONSTRAINT fk_seat
        FOREIGN KEY (seat_id)
        REFERENCES seats (id)
        ON DELETE CASCADE,
    CONSTRAINT check_valid_dates CHECK (valid_from_date < valid_to_date)
);

-- +goose Down
DROP TABLE flight_costs; 