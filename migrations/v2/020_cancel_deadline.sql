-- +goose Up
ALTER TABLE reservations
ADD COLUMN cancellation_deadline TIMESTAMP WITH TIME ZONE;

-- +goose Down
ALTER TABLE reservations
DROP COLUMN cancellation_deadline;
