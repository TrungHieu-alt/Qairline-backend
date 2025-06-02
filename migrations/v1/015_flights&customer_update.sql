-- +goose Up
ALTER TABLE flights 
ADD COLUMN available_first_class_seats INT NOT NULL DEFAULT 0,
ADD COLUMN available_business_class_seats INT NOT NULL DEFAULT 0,
ADD COLUMN available_economy_class_seats INT NOT NULL DEFAULT 0;

-- +goose Down
ALTER TABLE flights 
DROP COLUMN available_first_class_seats,
DROP COLUMN available_business_class_seats,
DROP COLUMN available_economy_class_seats;

