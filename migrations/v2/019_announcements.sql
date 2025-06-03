-- +goose Up
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INFO', 'WARNING', 'PROMOTION', 'MAINTENANCE', 'DELAY')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    priority INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (start_date < end_date OR end_date IS NULL)
);

-- Insert sample announcements
INSERT INTO announcements (title, content, type, status, start_date, end_date, priority) VALUES
(
    'Chương trình khuyến mãi mùa hè 2025',
    'Đặt vé trước 30 ngày và nhận ngay ưu đãi giảm giá 20% cho tất cả các chuyến bay nội địa.',
    'PROMOTION',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    1
),
(
    'Bảo trì hệ thống đặt vé',
    'Hệ thống đặt vé sẽ được bảo trì từ 02:00 đến 04:00 ngày 15/06/2025. Quý khách vui lòng lưu ý.',
    'MAINTENANCE',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    2
),
(
    'Thông báo về dịch vụ mới',
    'Từ ngày 01/07/2025, chúng tôi sẽ cung cấp dịch vụ WiFi miễn phí trên tất cả các chuyến bay.',
    'INFO',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '60 days',
    0
),
(
    'Cập nhật chính sách hành lý',
    'Từ ngày 01/08/2025, hành khách được phép mang thêm 5kg hành lý xách tay.',
    'INFO',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '90 days',
    0
),
(
    'Cảnh báo thời tiết',
    'Dự báo thời tiết xấu tại sân bay Tân Sơn Nhất từ 15/06 đến 17/06/2025. Có thể có chuyến bay bị ảnh hưởng.',
    'WARNING',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    3
),
(
    'Chương trình khách hàng thân thiết',
    'Đăng ký thành viên Qairline Rewards ngay hôm nay để nhận ưu đãi đặc biệt và tích điểm cho mỗi chuyến bay.',
    'PROMOTION',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '45 days',
    1
),
(
    'Thông báo về chuyến bay bị hoãn',
    'Chuyến bay QN123 từ Hà Nội đến TP.HCM ngày 10/06/2025 sẽ bị hoãn 2 giờ do điều kiện thời tiết.',
    'DELAY',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    3
);

-- +goose Down
DROP TABLE announcements; 