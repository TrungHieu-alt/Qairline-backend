-- +goose Up
-- +goose StatementBegin
DO $$
DECLARE
    aircraft_record RECORD;
    aircraft_type_record RECORD;
    economy_class_id UUID;
    business_class_id UUID;
    first_class_id UUID;
    economy_seats INT;
    business_seats INT;
    first_seats INT;
    seat_number TEXT;
    i INT;
BEGIN
    -- Lấy ID của các hạng ghế
    SELECT id INTO economy_class_id FROM travel_classes WHERE name = 'Economy';
    SELECT id INTO business_class_id FROM travel_classes WHERE name = 'Business';
    SELECT id INTO first_class_id FROM travel_classes WHERE name = 'First';

    -- Lặp qua tất cả máy bay
    FOR aircraft_record IN SELECT id, aircraft_type_id FROM aircrafts LOOP
        -- Lấy total_seats từ aircraft_types
        SELECT total_seats INTO aircraft_type_record
        FROM aircraft_types
        WHERE id = aircraft_record.aircraft_type_id;

        -- Phân bổ ghế: 5% First, 15% Business, 80% Economy
        first_seats := FLOOR(aircraft_type_record.total_seats * 0.05);
        business_seats := FLOOR(aircraft_type_record.total_seats * 0.15);
        economy_seats := aircraft_type_record.total_seats - first_seats - business_seats;

        -- Tạo ghế hạng First
        FOR i IN 1..first_seats LOOP
            seat_number := CONCAT('F', i); -- Ví dụ: F1, F2, ...
            INSERT INTO seats (aircraft_id, seat_number, travel_class_id)
            VALUES (aircraft_record.id, seat_number, first_class_id)
            ON CONFLICT ON CONSTRAINT unique_seat_per_aircraft DO NOTHING;
        END LOOP;

        -- Tạo ghế hạng Business
        FOR i IN 1..business_seats LOOP
            seat_number := CONCAT('B', i); -- Ví dụ: B1, B2, ...
            INSERT INTO seats (aircraft_id, seat_number, travel_class_id)
            VALUES (aircraft_record.id, seat_number, business_class_id)
            ON CONFLICT ON CONSTRAINT unique_seat_per_aircraft DO NOTHING;
        END LOOP;

        -- Tạo ghế hạng Economy
        FOR i IN 1..economy_seats LOOP
            seat_number := CONCAT('E', i); -- Ví dụ: E1, E2, ...
            INSERT INTO seats (aircraft_id, seat_number, travel_class_id)
            VALUES (aircraft_record.id, seat_number, economy_class_id)
            ON CONFLICT ON CONSTRAINT unique_seat_per_aircraft DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM seats;
-- +goose StatementEnd