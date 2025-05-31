-- +goose Up
CREATE TABLE airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    city TEXT,
    country TEXT,
    CONSTRAINT check_airport_code CHECK (LENGTH(code) = 3)
);

INSERT INTO airports (name, code, city, country) VALUES
('Noi Bai International Airport', 'HAN', 'Hanoi', 'Vietnam'),
('Tan Son Nhat International Airport', 'SGN', 'Ho Chi Minh City', 'Vietnam'),
('Da Nang International Airport', 'DAD', 'Da Nang', 'Vietnam'),
('Cam Ranh International Airport', 'CXR', 'Nha Trang', 'Vietnam'),
('Phu Quoc International Airport', 'PQC', 'Phu Quoc', 'Vietnam'),
('Can Tho International Airport', 'VCA', 'Can Tho', 'Vietnam'),
('Vinh International Airport', 'VII', 'Vinh', 'Vietnam'),
('Cat Bi International Airport', 'HPH', 'Hai Phong', 'Vietnam'),
('Chu Lai International Airport', 'VCL', 'Quang Nam', 'Vietnam'),
('Phu Bai International Airport', 'HUI', 'Hue', 'Vietnam'),
('Buon Ma Thuot Airport', 'BMV', 'Buon Ma Thuot', 'Vietnam'),
('Lien Khuong Airport', 'DLI', 'Da Lat', 'Vietnam'),
('Pleiku Airport', 'PXU', 'Pleiku', 'Vietnam'),
('Phu Cat Airport', 'UIH', 'Quy Nhon', 'Vietnam'),
('Dong Hoi Airport', 'VDH', 'Dong Hoi', 'Vietnam'),
('Tho Xuan Airport', 'THD', 'Thanh Hoa', 'Vietnam'),
('Con Dao Airport', 'VCS', 'Con Dao', 'Vietnam'),
('Rach Gia Airport', 'VKG', 'Rach Gia', 'Vietnam'),
('Dien Bien Phu Airport', 'DIN', 'Dien Bien Phu', 'Vietnam'),
('Tuy Hoa Airport', 'TBB', 'Tuy Hoa', 'Vietnam'),
('Ca Mau Airport', 'CAH', 'Ca Mau', 'Vietnam'),
('Changi Airport', 'SIN', 'Singapore', 'Singapore'),
('Suvarnabhumi Airport', 'BKK', 'Bangkok', 'Thailand'),
('Incheon International Airport', 'ICN', 'Seoul', 'South Korea'),
('Tokyo Haneda Airport', 'HND', 'Tokyo', 'Japan'),
('Beijing Capital International Airport', 'PEK', 'Beijing', 'China');


-- +goose Down
DROP TABLE airports;
