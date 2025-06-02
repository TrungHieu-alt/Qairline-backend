-- +goose Up
CREATE TABLE travel_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO travel_classes (name, description)
VALUES
('Economy', 'Economy class is the most affordable travel class.'),
('Business', 'Business class is the most comfortable travel class.'),
('First', 'First class is the most luxurious travel class.');

-- +goose Down
DROP TABLE travel_classes;