-- +goose Up
CREATE TABLE aircraft_seat_layout (
    aircraft_type_id UUID NOT NULL,
    travel_class_id UUID NOT NULL,
    capacity INT NOT NULL CONSTRAINT capacity_check CHECK (capacity >= 0),
    CONSTRAINT aircraft_type_configuration_pk PRIMARY KEY (aircraft_type_id, travel_class_id),
    CONSTRAINT aircraft_type_configuration_aircraft_type_fk
        FOREIGN KEY (aircraft_type_id) REFERENCES aircraft_types (id),
    CONSTRAINT aircraft_type_configuration_travel_class_fk
        FOREIGN KEY (travel_class_id) REFERENCES travel_classes (id)
);

-- Airbus A320 seat layout
INSERT INTO aircraft_seat_layout (aircraft_type_id, travel_class_id, capacity)
VALUES
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A320'),
    (SELECT id FROM travel_classes WHERE name = 'Economy'),
    100
),
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A320'),
    (SELECT id FROM travel_classes WHERE name = 'Business'),
    50
),
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A320'),
    (SELECT id FROM travel_classes WHERE name = 'First'),
    30
);

-- Airbus A321 seat layout
INSERT INTO aircraft_seat_layout (aircraft_type_id, travel_class_id, capacity)
VALUES
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A321'),
    (SELECT id FROM travel_classes WHERE name = 'Economy'),
    100
),
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A321'),
    (SELECT id FROM travel_classes WHERE name = 'Business'),
    30
),
(
    (SELECT id FROM aircraft_types WHERE name = 'Airbus A321'),
    (SELECT id FROM travel_classes WHERE name = 'First'),
    20
);

-- +goose Down
DROP TABLE aircraft_seat_layout;