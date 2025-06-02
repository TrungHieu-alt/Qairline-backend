-- +goose Up
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID NOT NULL,
    customer_id UUID, -- Bỏ NOT NULL để hỗ trợ vé guest
    ticket_class_id UUID NOT NULL,
    seat_number TEXT,
    price DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ticket_status TEXT NOT NULL DEFAULT 'PendingPayment',
    ticket_code UUID NOT NULL UNIQUE,
    guest_first_name TEXT, -- Thông tin cho khách guest
    guest_last_name TEXT,
    guest_email TEXT,
    guest_phone_number TEXT,
    is_guest BOOLEAN NOT NULL DEFAULT FALSE, -- Phân biệt vé guest và vé của khách đăng ký
    CONSTRAINT fk_flight FOREIGN KEY (flight_id) REFERENCES flights(id),
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_ticket_class FOREIGN KEY (ticket_class_id) REFERENCES ticket_classes(id),
    CONSTRAINT check_status CHECK (ticket_status IN ('PendingPayment', 'Confirmed', 'Cancelled')),
    CONSTRAINT unique_flight_seat UNIQUE (flight_id, seat_number),
    CONSTRAINT check_guest_info CHECK (
        (is_guest = TRUE AND guest_email IS NOT NULL AND guest_first_name IS NOT NULL AND guest_last_name IS NOT NULL) OR
        (is_guest = FALSE AND customer_id IS NOT NULL)
    ) -- Đảm bảo thông tin đầy đủ cho vé guest hoặc vé khách đăng ký
);
CREATE INDEX idx_tickets_flight_class_status ON tickets(flight_id, ticket_class_id, ticket_status);

INSERT INTO tickets (
    flight_id,
    customer_id,
    ticket_class_id,
    seat_number,
    price,
    booking_date,
    ticket_status,
    ticket_code,
    is_guest,
    guest_first_name,
    guest_last_name,
    guest_email,
    guest_phone_number
) VALUES
(
    (SELECT id FROM flights WHERE flight_number = 'QA101'),
    NULL,
    (SELECT id FROM ticket_classes WHERE class_name = 'Economy'),
    '12A',
    110.00,
    CURRENT_TIMESTAMP,
    'Confirmed',
    gen_random_uuid(),
    TRUE,
    'Nguyen',
    'Van A',
    'nguyenvana@example.com',
    '0901234567'
),
(
    (SELECT id FROM flights WHERE flight_number = 'QA102'),
    NULL,
    (SELECT id FROM ticket_classes WHERE class_name = 'Business'),
    '03C',
    195.00,
    CURRENT_TIMESTAMP,
    'PendingPayment',
    gen_random_uuid(),
    TRUE,
    'Le',
    'Thi B',
    'lethib@example.com',
    '0908765432'
),
(
    (SELECT id FROM flights WHERE flight_number = 'QA201'),
    NULL,
    (SELECT id FROM ticket_classes WHERE class_name = 'First'),
    '01B',
    420.00,
    CURRENT_TIMESTAMP,
    'Confirmed',
    gen_random_uuid(),
    TRUE,
    'Pham',
    'Van C',
    'phamvanc@example.com',
    '0911223344'
),
(
    (SELECT id FROM flights WHERE flight_number = 'QA301'),
    NULL,
    (SELECT id FROM ticket_classes WHERE class_name = 'Economy'),
    '20F',
    75.00,
    CURRENT_TIMESTAMP,
    'PendingPayment',
    gen_random_uuid(),
    TRUE,
    'Tran',
    'Minh D',
    'tranminhd@example.com',
    '0966778899'
),
(
    (SELECT id FROM flights WHERE flight_number = 'QA401'),
    NULL,
    (SELECT id FROM ticket_classes WHERE class_name = 'Business'),
    '07A',
    400.00,
    CURRENT_TIMESTAMP,
    'Confirmed',
    gen_random_uuid(),
    TRUE,
    'Hoang',
    'Kim E',
    'hoangkime@example.com',
    '0977889900'
);

-- +goose Down
DROP TABLE tickets;
