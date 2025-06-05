# Tài liệu API QAirline (Phiên bản cập nhật)

## Giới thiệu
Backend QAirline được xây dựng với Node.js và Express. Mọi đường dẫn bên dưới đều được gắn tiền tố `/api`. Một số API yêu cầu xác thực JWT và phân quyền (passenger hoặc admin).

## URL cơ bản
```
http://localhost:3000/api
```

## 1. API Xác thực
| Phương thức | Endpoint | Mô tả |
|-------------|----------|-------|
|`POST`|`/auth/register`|Đăng ký hành khách mới. Nhận thông tin cá nhân, trả về token.|
|`POST`|`/auth/login`|Đăng nhập bằng email và mật khẩu, trả về token.|

### Ví dụ body đăng ký
```json
{
  "email": "user@example.com",
  "password": "secret",
  "firstName": "A",
  "lastName": "B",
  "phoneNumber": "0123456789"
}
```

## 2. API Chuyến bay
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/flights`|Công khai|Danh sách chuyến bay.|
|`GET`|`/flights/:id`|Công khai|Chi tiết chuyến bay.|
|`POST`|`/flights/search`|Công khai|Tìm chuyến bay theo chặng.|
|`POST`|`/flights`|Admin|Tạo chuyến bay mới.|
|`PUT`|`/flights/:id/delay`|Admin|Dời thời gian bay.|
|`PUT`|`/flights/:id/cancel`|Admin|Huỷ chuyến bay.|
|`DELETE`|`/flights/:id`|Admin|Xoá chuyến bay.|

### Ví dụ body tạo chuyến bay
```json
{
  "aircraft_id": "uuid-may-bay",
  "source_airport_id": "uuid-san-bay-di",
  "destination_airport_id": "uuid-san-bay-den",
  "departure_time": "2025-06-01T08:00:00Z",
  "arrival_time": "2025-06-01T10:00:00Z"
}
```

## 3. API Đặt chỗ (Reservation)
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`POST`|`/reservations`|Passenger|Tạo đặt chỗ mới.|
|`GET`|`/reservations/:id`|Đã đăng nhập|Lấy chi tiết đặt chỗ.|
|`PUT`|`/reservations/:id/cancel`|Passenger|Huỷ đặt chỗ.|
|`GET`|`/passengers/:passengerId/reservations`|Passenger/Admin|Danh sách đặt chỗ của hành khách.|
|`GET`|`/reservations`|Admin|Danh sách toàn bộ đặt chỗ.|

### Ví dụ body tạo đặt chỗ
```json
{
  "passenger_id": "uuid-passenger",
  "seat_id": "uuid-seat",
  "payment": {
    "amount": 100,
    "status": "N"
  }
}
```

## 4. API Hành khách
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/passengers`|Admin|Danh sách hành khách.|
|`GET`|`/passengers/:id`|Admin|Chi tiết hành khách.|
|`POST`|`/passengers`|Admin|Tạo hành khách.|
|`PUT`|`/passengers/:id`|Admin|Cập nhật hành khách.|
|`DELETE`|`/passengers/:id`|Admin|Xoá hành khách.|

## 5. API Máy bay
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/aircrafts`|Công khai|Danh sách máy bay.|
|`GET`|`/aircrafts/:id`|Công khai|Chi tiết máy bay.|
|`POST`|`/aircrafts`|Admin|Tạo máy bay.|
|`PUT`|`/aircrafts/:id`|Admin|Cập nhật máy bay.|
|`DELETE`|`/aircrafts/:id`|Admin|Xoá máy bay.|

## 6. API Hãng bay
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/airlines`|Công khai|Danh sách hãng bay.|
|`GET`|`/airlines/:id`|Công khai|Chi tiết hãng bay.|
|`POST`|`/airlines`|Admin|Tạo hãng bay.|
|`PUT`|`/airlines/:id`|Admin|Cập nhật hãng bay.|
|`DELETE`|`/airlines/:id`|Admin|Xoá hãng bay.|

## 7. API Sân bay
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/airports`|Công khai|Danh sách sân bay.|
|`GET`|`/airports/:id`|Công khai|Chi tiết sân bay.|
|`POST`|`/airports`|Admin|Tạo sân bay.|
|`PUT`|`/airports/:id`|Admin|Cập nhật sân bay.|
|`DELETE`|`/airports/:id`|Admin|Xoá sân bay.|

## 8. API Thông báo
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/announcements`|Công khai|Danh sách thông báo.|
|`GET`|`/announcements/:id`|Công khai|Chi tiết thông báo.|
|`POST`|`/announcements`|Admin|Tạo thông báo.|
|`PUT`|`/announcements/:id`|Admin|Cập nhật thông báo.|
|`DELETE`|`/announcements/:id`|Admin|Xoá thông báo.|

## 9. API Hạng ghế
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/ticket-classes`|Công khai|Danh sách hạng ghế.|
|`GET`|`/ticket-classes/:id`|Công khai|Chi tiết hạng ghế.|
|`POST`|`/ticket-classes`|Admin|Tạo hạng ghế.|
|`PUT`|`/ticket-classes/:id`|Admin|Cập nhật hạng ghế.|
|`DELETE`|`/ticket-classes/:id`|Admin|Xoá hạng ghế.|

## 10. API Dịch vụ trên hạng ghế
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/service-offerings`|Công khai|Danh sách dịch vụ.|
|`GET`|`/service-offerings/:travelClassId/:serviceId`|Công khai|Chi tiết dịch vụ theo hạng ghế và dịch vụ.|
|`POST`|`/service-offerings`|Admin|Tạo dịch vụ cho hạng ghế.|
|`PUT`|`/service-offerings/:travelClassId/:serviceId`|Admin|Cập nhật dịch vụ.|
|`DELETE`|`/service-offerings/:travelClassId/:serviceId`|Admin|Xoá dịch vụ.|

## 11. API Thành phố
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/cities`|Công khai|Danh sách thành phố.|
|`GET`|`/cities/:id`|Admin|Chi tiết thành phố.|
|`POST`|`/cities`|Admin|Tạo thành phố.|
|`PUT`|`/cities/:id`|Admin|Cập nhật thành phố.|
|`DELETE`|`/cities/:id`|Admin|Xoá thành phố.|

## 12. API Quốc gia
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/countries`|Công khai|Danh sách quốc gia.|
|`GET`|`/countries/:id`|Admin|Chi tiết quốc gia.|
|`POST`|`/countries`|Admin|Tạo quốc gia.|
|`PUT`|`/countries/:id`|Admin|Cập nhật quốc gia.|
|`DELETE`|`/countries/:id`|Admin|Xoá quốc gia.|

## 13. API Thống kê (Admin)
| Phương thức | Endpoint | Mô tả |
|-------------|----------|-------|
|`GET`|`/stats`|Số liệu tổng quan dashboard.|
|`GET`|`/recent-bookings`|Danh sách đặt chỗ gần đây.|
|`GET`|`/upcoming-flights`|Chuyến bay sắp khởi hành.|
|`GET`|`/booking-trends`|Xu hướng đặt vé đã thanh toán.|

## 14. Tìm chuyến bay nhiều chặng
Ví dụ gọi `/flights/search` với body:
```json
{
  "legs": [
    { "from_airport_id": "uuid1", "to_airport_id": "uuid2", "date": "2025-06-01" },
    { "from_airport_id": "uuid2", "to_airport_id": "uuid3", "date": "2025-06-05" }
  ]
}
```
Kết quả trả về dạng:
```json
{
  "success": true,
  "data": [
    [ /* chặng 1 */ ],
    [ /* chặng 2 */ ]
  ]
}
```

Tài liệu trên bao quát toàn bộ endpoint hiện có của hệ thống. Hãy gửi token qua header `Authorization: Bearer <token>` khi gọi các API yêu cầu xác thực.
