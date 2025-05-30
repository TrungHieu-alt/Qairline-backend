-- +goose Up
-- +goose StatementBegin
CREATE FUNCTION check_seat_availability() RETURNS TRIGGER AS $$
DECLARE
    booked_seats INT;
    max_seats INT;
    class_name TEXT;
BEGIN
    -- Lấy tên hạng ghế
    SELECT tc.class_name INTO class_name
    FROM ticket_classes tc
    WHERE tc.id = NEW.ticket_class_id;

    -- Đếm số vé đã đặt cho hạng ghế này (bao gồm cả vé mới đang thêm)
    SELECT COUNT(*) INTO booked_seats
    FROM tickets t
    WHERE t.flight_id = NEW.flight_id
    AND t.ticket_class_id = NEW.ticket_class_id
    AND t.ticket_status IN ('PendingPayment', 'Confirmed');

    -- Lấy số ghế tối đa cho hạng ghế từ bảng aircrafts
    SELECT 
        CASE 
            WHEN class_name = 'First Class' THEN a.total_first_class_seats
            WHEN class_name = 'Business Class' THEN a.total_business_class_seats
            WHEN class_name = 'Economy Class' THEN a.total_economy_class_seats
        END INTO max_seats
    FROM flights f
    JOIN aircrafts a ON f.aircraft_id = a.id
    WHERE f.id = NEW.flight_id;

    -- Kiểm tra nếu số vé đã đặt vượt quá số ghế tối đa
    IF booked_seats >= max_seats THEN
        RAISE EXCEPTION 'No available seats for % on flight %', class_name, NEW.flight_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_seat_availability
BEFORE INSERT OR UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION check_seat_availability();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_check_seat_availability ON tickets;
DROP FUNCTION IF EXISTS check_seat_availability();
-- +goose StatementEnd
