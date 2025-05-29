-- +goose Up
-- +goose StatementBegin
-- Migration: Add perks for ticket classes
-- Description: Creates perks and ticket_class_perks tables to manage unique perks for each ticket class.

-- Create perks table
CREATE TABLE perks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    CONSTRAINT check_name_not_empty CHECK (name <> '')
);

-- Create ticket_class_perks table (many-to-many relationship)
CREATE TABLE ticket_class_perks (
    ticket_class_id UUID NOT NULL,
    perk_id UUID NOT NULL,
    PRIMARY KEY (ticket_class_id, perk_id),
    CONSTRAINT fk_ticket_class FOREIGN KEY (ticket_class_id) REFERENCES ticket_classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_perk FOREIGN KEY (perk_id) REFERENCES perks(id) ON DELETE CASCADE
);

-- Insert sample perks
INSERT INTO perks (name, description) VALUES
    ('VIP Lounge Access', 'Access to exclusive airport lounges with complimentary food and drinks'),
    ('Priority Boarding', 'Board the plane before other passengers'),
    ('Gourmet Meals', 'Premium in-flight dining experience'),
    ('Extra Legroom', 'Seats with additional legroom for comfort');

-- Link perks to ticket classes
INSERT INTO ticket_class_perks (ticket_class_id, perk_id)
SELECT tc.id, p.id
FROM ticket_classes tc
CROSS JOIN perks p
WHERE (tc.class_name, p.name) IN (
    ('First Class', 'VIP Lounge Access'),
    ('First Class', 'Priority Boarding'),
    ('First Class', 'Gourmet Meals'),
    ('First Class', 'Extra Legroom'),
    ('Business Class', 'Priority Boarding'),
    ('Business Class', 'Gourmet Meals'),
    ('Business Class', 'Extra Legroom')
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Rollback: Remove perks and ticket_class_perks tables
-- Description: Drops tables and constraints added for perks management.

-- Drop ticket_class_perks table (automatically drops constraints due to CASCADE)
DROP TABLE IF EXISTS ticket_class_perks;

-- Drop perks table
DROP TABLE IF EXISTS perks;
-- +goose StatementEnd
