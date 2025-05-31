-- +goose Up
ALTER TABLE tickets ADD COLUMN cancellation_deadline TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours';


-- +goose Down
ALTER TABLE tickets DROP COLUMN cancellation_deadline;
