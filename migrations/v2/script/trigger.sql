CREATE OR REPLACE FUNCTION check_aircraft_seat_capacity()
RETURNS TRIGGER AS $$
DECLARE
    total_capacity INT;
    max_seats INT;
BEGIN
    SELECT SUM(capacity) INTO total_capacity
    FROM aircraft_seat_layout
    WHERE aircraft_type_id = NEW.aircraft_type_id;

    SELECT total_seats INTO max_seats
    FROM aircraft_types
    WHERE id = NEW.aircraft_type_id;

    IF total_capacity > max_seats THEN
        RAISE EXCEPTION 'Tổng số ghế (%) vượt quá sức chứa tối đa (%) của loại tàu bay.', total_capacity, max_seats;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aircraft_seat_capacity_trigger
AFTER INSERT OR UPDATE ON aircraft_seat_layout
FOR EACH ROW
EXECUTE FUNCTION check_aircraft_seat_capacity();