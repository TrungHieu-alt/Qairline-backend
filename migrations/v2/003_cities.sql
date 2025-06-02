-- +goose Up
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    country_id UUID NOT NULL,
    CONSTRAINT fk_country
        FOREIGN KEY (country_id)
        REFERENCES countries (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_city_country UNIQUE (name, country_id)
);

INSERT INTO cities (name, country_id) 
VALUES 
('Hanoi', (SELECT id FROM countries WHERE code = 'VN')),
('Ho Chi Minh City', (SELECT id FROM countries WHERE code = 'VN')),
('Da Nang', (SELECT id FROM countries WHERE code = 'VN')),
('Nha Trang', (SELECT id FROM countries WHERE code = 'VN')),
('Phu Quoc', (SELECT id FROM countries WHERE code = 'VN')),
('Can Tho', (SELECT id FROM countries WHERE code = 'VN')),
('Vinh', (SELECT id FROM countries WHERE code = 'VN')),
('Hai Phong', (SELECT id FROM countries WHERE code = 'VN')),
('Quang Nam', (SELECT id FROM countries WHERE code = 'VN')),
('Hue', (SELECT id FROM countries WHERE code = 'VN')),
('Buon Ma Thuot', (SELECT id FROM countries WHERE code = 'VN')),
('Da Lat', (SELECT id FROM countries WHERE code = 'VN')),
('Pleiku', (SELECT id FROM countries WHERE code = 'VN')),
('Quy Nhon', (SELECT id FROM countries WHERE code = 'VN')),
('Dong Hoi', (SELECT id FROM countries WHERE code = 'VN')),
('Thanh Hoa', (SELECT id FROM countries WHERE code = 'VN')),
('Con Dao', (SELECT id FROM countries WHERE code = 'VN')),
('Rach Gia', (SELECT id FROM countries WHERE code = 'VN')),
('Dien Bien Phu', (SELECT id FROM countries WHERE code = 'VN')),
('Tuy Hoa', (SELECT id FROM countries WHERE code = 'VN')),
('Ca Mau', (SELECT id FROM countries WHERE code = 'VN')),

('Singapore', (SELECT id FROM countries WHERE code = 'SG')),
('Bangkok', (SELECT id FROM countries WHERE code = 'TH')),
('Seoul', (SELECT id FROM countries WHERE code = 'KR')),
('Tokyo', (SELECT id FROM countries WHERE code = 'JP')),
('Beijing', (SELECT id FROM countries WHERE code = 'CN'));

-- +goose Down
DROP TABLE cities;