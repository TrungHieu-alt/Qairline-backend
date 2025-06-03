-- +goose Up
CREATE TABLE flight_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_service_name UNIQUE (name)
);

-- Insert some basic flight services
INSERT INTO flight_services (name, description) VALUES
('Meal Service', 'In-flight meal service'),
('Entertainment', 'In-flight entertainment system'),
('WiFi', 'In-flight WiFi access'),
('Priority Boarding', 'Priority boarding service'),
('Extra Legroom', 'Seats with extra legroom'),
('Lounge Access', 'Airport lounge access'),
('Baggage Allowance', 'Extra baggage allowance'),
('Priority Check-in', 'Priority check-in service');

-- +goose Down
DROP TABLE flight_services; 