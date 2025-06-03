-- +goose Up
CREATE TABLE seat_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    travel_class_id UUID NOT NULL,
    flight_id UUID NOT NULL,
    CONSTRAINT fk_travel_class
        FOREIGN KEY (travel_class_id)
        REFERENCES travel_classes (id),
    CONSTRAINT fk_flight_details
        FOREIGN KEY (flight_id)
        REFERENCES flights (id)
);

-- +goose Down
DROP TABLE seat_details;
