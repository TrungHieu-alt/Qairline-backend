-- +goose Up
CREATE TABLE ticket_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name TEXT NOT NULL,
    coefficient DECIMAL(4, 2) NOT NULL,
    CONSTRAINT check_coefficient CHECK (coefficient >= 1.0)
);
INSERT INTO ticket_classes (class_name, coefficient) VALUES
('Economy', 1.00),     -- Economy is typically the base price, so coefficient is 1.00
('Business', 1.80),    -- Business Class price is often 1.8 to 3 times Economy
('First', 3.50);       -- First Class price can be 3.5 to 10+ times Economy


-- +goose Down
DROP TABLE ticket_classes;
