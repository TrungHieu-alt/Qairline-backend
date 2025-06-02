-- +goose Up
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL
);

INSERT INTO countries (name, code) 
VALUES 
('Vietnam', 'VN'),
('Singapore', 'SG'),
('Thailand', 'TH'),
('South Korea', 'KR'),
('Japan', 'JP'),
('China', 'CN');

-- +goose Down
DROP TABLE countries;