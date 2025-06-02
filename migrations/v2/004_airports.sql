-- +goose Up
CREATE TABLE airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    city_id UUID NOT NULL,
    CONSTRAINT fk_city
        FOREIGN KEY (city_id)
        REFERENCES cities (id)
        ON DELETE CASCADE,
    CONSTRAINT check_airport_code CHECK (LENGTH(code) = 3)
);

INSERT INTO airports (name, code, city_id)
VALUES
('Noi Bai International Airport', 'HAN', (SELECT id FROM cities WHERE name = 'Hanoi')),
('Tan Son Nhat International Airport', 'SGN', (SELECT id FROM cities WHERE name = 'Ho Chi Minh City')),
('Da Nang International Airport', 'DAD', (SELECT id FROM cities WHERE name = 'Da Nang')),
('Cam Ranh International Airport', 'CXR', (SELECT id FROM cities WHERE name = 'Nha Trang')),
('Phu Quoc International Airport', 'PQC', (SELECT id FROM cities WHERE name = 'Phu Quoc')),
('Can Tho International Airport', 'VCA', (SELECT id FROM cities WHERE name = 'Can Tho')),
('Vinh International Airport', 'VII', (SELECT id FROM cities WHERE name = 'Vinh')),
('Cat Bi International Airport', 'HPH', (SELECT id FROM cities WHERE name = 'Hai Phong')),
('Chu Lai International Airport', 'VCL', (SELECT id FROM cities WHERE name = 'Quang Nam')),
('Phu Bai International Airport', 'HUI', (SELECT id FROM cities WHERE name = 'Hue')),
('Buon Ma Thuot Airport', 'BMV', (SELECT id FROM cities WHERE name = 'Buon Ma Thuot')),
('Lien Khuong Airport', 'DLI', (SELECT id FROM cities WHERE name = 'Da Lat')),
('Pleiku Airport', 'PXU', (SELECT id FROM cities WHERE name = 'Pleiku')),
('Phu Cat Airport', 'UIH', (SELECT id FROM cities WHERE name = 'Quy Nhon')),
('Dong Hoi Airport', 'VDH', (SELECT id FROM cities WHERE name = 'Dong Hoi')),
('Tho Xuan Airport', 'THD', (SELECT id FROM cities WHERE name = 'Thanh Hoa')),
('Con Dao Airport', 'VCS', (SELECT id FROM cities WHERE name = 'Con Dao')),
('Rach Gia Airport', 'VKG', (SELECT id FROM cities WHERE name = 'Rach Gia')),
('Dien Bien Phu Airport', 'DIN', (SELECT id FROM cities WHERE name = 'Dien Bien Phu')),
('Tuy Hoa Airport', 'TBB', (SELECT id FROM cities WHERE name = 'Tuy Hoa')),
('Ca Mau Airport', 'CAH', (SELECT id FROM cities WHERE name = 'Ca Mau')),

('Changi Airport', 'SIN', (SELECT id FROM cities WHERE name = 'Singapore')),
('Suvarnabhumi Airport', 'BKK', (SELECT id FROM cities WHERE name = 'Bangkok')),
('Incheon International Airport', 'ICN', (SELECT id FROM cities WHERE name = 'Seoul')),
('Tokyo Haneda Airport', 'HND', (SELECT id FROM cities WHERE name = 'Tokyo')),
('Beijing Capital International Airport', 'PEK', (SELECT id FROM cities WHERE name = 'Beijing'));

-- +goose Down
DROP TABLE airports;