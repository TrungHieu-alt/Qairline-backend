# Tài liệu API QAirline (Phiên bản cập nhật)

## Giới thiệu
Backend QAirline được xây dựng với Node.js và Express. Mọi đường dẫn bên dưới đều được gắn tiền tố `/api`. Một số API yêu cầu xác thực JWT và phân quyền (passenger hoặc admin).

### Lưu ý định dạng dữ liệu
- Các trường ID phải là chuỗi UUID hợp lệ.
- Trường ngày giờ tuân theo chuẩn ISO-8601.
- Các giá trị số (ví dụ `price`, `page`, `limit`) cần gửi dạng số.
- Mã sân bay, mã quốc gia, mã hãng hàng không phải viết hoa với độ dài cố định.
- Số điện thoại phải gồm đúng 10 chữ số (ví dụ `0123456789`).
- Trường `from_month`/`to_month` dùng định dạng `YYYY-MM`.
- Các trường boolean như `is_offered` nhận `true`/`false`.
- Trường trạng thái/loại chỉ nhận các giá trị hợp lệ:
  - `announcement.type`: `INFO`, `PROMOTION`, `WARNING`, `DELAY`, `MAINTENANCE`
  - `announcement.status`: `ACTIVE`, `INACTIVE`, `ARCHIVED`
  - `payment.status`: `NEW`, `PAID`, `CANCELLED`
  - `stats.interval`: `day`, `month`, `year`
- Middleware sẽ phản hồi lỗi xác thực nếu dữ liệu không tuân thủ quy tắc trên.

## URL cơ bản
```
http://localhost:3000/api
```

## 1. API Xác thực
| Phương thức | Endpoint | Mô tả |
|-------------|----------|-------|
|`POST`|`/auth/register`|Đăng ký hành khách mới. Nhận thông tin cá nhân, trả về token.|
|`POST`|`/auth/login`|Đăng nhập bằng email và mật khẩu, trả về token.|

### Header yêu cầu
Không cần gửi `Authorization` cho các API xác thực.

### Ví dụ body đăng ký
```json
{
  "email": "user@example.com",
  "password": "secret",
  "firstName": "A",
  "lastName": "B",
  "phone_number": "0123456789"
}
```

### Ví dụ body đăng nhập
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

### Phản hồi
Thành công: `201 Created` cho đăng ký hoặc `200 OK` cho đăng nhập.
```json
{
  "success": true,
  "data": {
    "token": "<jwt>"
  }
}
```

## 2. API Chuyến bay
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/flights`|Công khai|Danh sách chuyến bay.|
|`GET`|`/flights/:id`|Công khai|Chi tiết chuyến bay.|
|`GET`|`/flights/:id/passengers`|Admin|Danh sách hành khách của chuyến bay.|
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

### Header yêu cầu
`POST`, `PUT` và `DELETE` trong nhóm này cần gửi

```
Authorization: Bearer <token>
```

### Ví dụ body tìm chuyến bay
```json
{
  "from_airport_id": "uuid-san-bay-di",
  "to_airport_id": "uuid-san-bay-den",
  "date": "2025-06-01"
}
```

### Ví dụ body trì hoãn chuyến bay
```json
{
  "newDeparture": "2025-06-01T09:00:00Z",
  "newArrival": "2025-06-01T11:00:00Z"
}
```

### Phản hồi
Tạo mới: `201 Created`.
Các thao tác khác: `200 OK` với cấu trúc:
```json
{
  "success": true,
  "data": { /* dữ liệu hoặc thông báo */ }
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

### Header yêu cầu
Gửi `Authorization` cho tất cả route trong nhóm này.

```
Authorization: Bearer <token>
```

### Tham số đường dẫn
- `:id` - ID đặt chỗ.
- `:passengerId` - ID hành khách.

### Phản hồi
Tạo mới: `201 Created`. Các thao tác khác trả về `200 OK` cùng cấu trúc:
```json
{
  "success": true,
  "data": { /* thông tin đặt chỗ */ }
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
|`POST`|`/passengers/:passengerId/link-user/:userId`|Admin|Liên kết hành khách với người dùng.|

### Header yêu cầu
Tất cả route cần `Authorization` của admin.

```
Authorization: Bearer <token>
```

### Ví dụ body tạo/cập nhật hành khách
```json
{
  "first_name": "A",
  "last_name": "B",
  "phone_number": "0123456789"
}
```

### Tham số đường dẫn
- `:id` hoặc `:passengerId` - ID hành khách.
- `:userId` - ID người dùng cần liên kết.

### Phản hồi
`201 Created` khi tạo, còn lại `200 OK`.
```json
{
  "success": true,
  "data": {}
}
```

## 5. API Máy bay
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/aircrafts`|Công khai|Danh sách máy bay.|
|`GET`|`/aircrafts/:id`|Công khai|Chi tiết máy bay.|
|`POST`|`/aircrafts`|Admin|Tạo máy bay.|
|`PUT`|`/aircrafts/:id`|Admin|Cập nhật máy bay.|
|`DELETE`|`/aircrafts/:id`|Admin|Xoá máy bay.|

### Header yêu cầu
Chỉ các thao tác tạo, cập nhật, xoá cần `Authorization` quyền admin.

```
Authorization: Bearer <token>
```

### Ví dụ body tạo máy bay
```json
{
  "airline_id": "uuid-airline",
  "aircraft_type_id": "uuid-type",
  "registration_number": "REG-01"
}
```

### Phản hồi
`201 Created` khi tạo mới, các thao tác khác trả về `200 OK`.

## 6. API Hãng bay
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/airlines`|Công khai|Danh sách hãng bay.|
|`GET`|`/airlines/:id`|Công khai|Chi tiết hãng bay.|
|`POST`|`/airlines`|Admin|Tạo hãng bay.|
|`PUT`|`/airlines/:id`|Admin|Cập nhật hãng bay.|
|`DELETE`|`/airlines/:id`|Admin|Xoá hãng bay.|

### Header yêu cầu
`POST`, `PUT`, `DELETE` cần quyền admin.

```
Authorization: Bearer <token>
```

### Ví dụ body tạo hãng bay
```json
{
  "name": "QAir",
  "code": "QA"
}
```

### Phản hồi
Tạo mới: `201 Created`. Các thao tác khác trả về `200 OK`.

## 7. API Sân bay
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/airports`|Công khai|Danh sách sân bay.|
|`GET`|`/airports/:id`|Công khai|Chi tiết sân bay.|
|`POST`|`/airports`|Admin|Tạo sân bay.|
|`PUT`|`/airports/:id`|Admin|Cập nhật sân bay.|
|`DELETE`|`/airports/:id`|Admin|Xoá sân bay.|

### Header yêu cầu
`POST`, `PUT`, `DELETE` yêu cầu quyền admin.

```
Authorization: Bearer <token>
```

### Ví dụ body tạo sân bay
```json
{
  "name": "Noi Bai",
  "city_id": "uuid-city",
  "code": "HAN"
}
```

### Phản hồi
`201 Created` khi tạo, `200 OK` cho các thao tác khác.

## 8. API Thông báo
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/announcements`|Công khai|Danh sách thông báo.|
|`GET`|`/announcements/:id`|Công khai|Chi tiết thông báo.|
|`POST`|`/announcements`|Admin|Tạo thông báo.|
|`PUT`|`/announcements/:id`|Admin|Cập nhật thông báo.|
|`DELETE`|`/announcements/:id`|Admin|Xoá thông báo.|

### Header yêu cầu
`POST`, `PUT`, `DELETE` yêu cầu `Authorization` quyền admin.

```
Authorization: Bearer <token>
```

### Ví dụ body tạo thông báo
```json
{
  "title": "Thông báo mới",
  "content": "Nội dung thông báo"
}
```

### Phản hồi
`201 Created` khi tạo, `200 OK` cho các thao tác còn lại.

## 9. API Hạng ghế
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/ticket-classes`|Công khai|Danh sách hạng ghế.|
|`GET`|`/ticket-classes/:id`|Công khai|Chi tiết hạng ghế.|
|`POST`|`/ticket-classes`|Admin|Tạo hạng ghế.|
|`PUT`|`/ticket-classes/:id`|Admin|Cập nhật hạng ghế.|
|`DELETE`|`/ticket-classes/:id`|Admin|Xoá hạng ghế.|

### Header yêu cầu
`POST`, `PUT`, `DELETE` cần quyền admin.

```
Authorization: Bearer <token>
```

### Ví dụ body tạo hạng ghế
```json
{
  "name": "Economy"
}
```

### Phản hồi
`201 Created` khi tạo, `200 OK` cho những thao tác khác.

## 10. API Dịch vụ trên hạng ghế
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/service-offerings`|Công khai|Danh sách dịch vụ.|
|`GET`|`/service-offerings/:travelClassId/:serviceId`|Công khai|Chi tiết dịch vụ theo hạng ghế và dịch vụ.|
|`POST`|`/service-offerings`|Admin|Tạo dịch vụ cho hạng ghế.|
|`PUT`|`/service-offerings/:travelClassId/:serviceId`|Admin|Cập nhật dịch vụ.|
|`DELETE`|`/service-offerings/:travelClassId/:serviceId`|Admin|Xoá dịch vụ.|

### Header yêu cầu
`POST`, `PUT`, `DELETE` yêu cầu quyền admin.

```
Authorization: Bearer <token>
```

### Ví dụ body tạo dịch vụ
```json
{
  "travel_class_id": "uuid-class",
  "service_id": "uuid-service",
  "price": 20
}
```

### Phản hồi
`201 Created` khi tạo, `200 OK` cho thao tác khác.

## 11. API Thành phố
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/cities`|Công khai|Danh sách thành phố.|
|`GET`|`/cities/:id`|Admin|Chi tiết thành phố.|
|`POST`|`/cities`|Admin|Tạo thành phố.|
|`PUT`|`/cities/:id`|Admin|Cập nhật thành phố.|
|`DELETE`|`/cities/:id`|Admin|Xoá thành phố.|

### Header yêu cầu
`GET /cities` không cần xác thực. Các route còn lại yêu cầu admin.

```
Authorization: Bearer <token>
```

### Ví dụ body tạo thành phố
```json
{
  "name": "Hà Nội",
  "country_id": "uuid-country"
}
```

### Phản hồi
`201 Created` cho tạo mới, `200 OK` cho các thao tác khác.

## 12. API Quốc gia
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/countries`|Công khai|Danh sách quốc gia.|
|`GET`|`/countries/:id`|Admin|Chi tiết quốc gia.|
|`POST`|`/countries`|Admin|Tạo quốc gia.|
|`PUT`|`/countries/:id`|Admin|Cập nhật quốc gia.|
|`DELETE`|`/countries/:id`|Admin|Xoá quốc gia.|

### Header yêu cầu
`GET /countries` công khai. Các route khác yêu cầu admin.

```
Authorization: Bearer <token>
```

### Ví dụ body tạo quốc gia
```json
{
  "name": "Việt Nam",
  "iso_code": "VN"
}
```

### Phản hồi
`201 Created` khi tạo, `200 OK` cho các thao tác khác.

## 13. API Thống kê (Admin)
| Phương thức | Endpoint | Mô tả |
|-------------|----------|-------|
|`GET`|`/stats`|Số liệu tổng quan dashboard.|
|`GET`|`/recent-bookings`|Danh sách đặt chỗ gần đây.|
|`GET`|`/upcoming-flights`|Chuyến bay sắp khởi hành.|
|`GET`|`/booking-trends`|Xu hướng đặt vé đã thanh toán.|
|`GET`|`/stats/revenue-by-time`|Doanh thu theo thời gian.|
|`GET`|`/stats/revenue-by-route`|Doanh thu theo tuyến bay.|
|`GET`|`/stats/revenue-by-airline`|Doanh thu theo hãng bay.|
|`GET`|`/stats/revenue-by-travel-class`|Doanh thu theo hạng ghế.|

### Header yêu cầu
Tất cả các route thống kê yêu cầu quyền admin.

```
Authorization: Bearer <token>
```

### Tham số query ví dụ
- `/recent-bookings?limit=5`
- `/booking-trends?days=30`
- `/stats/revenue-by-time?startDate=2025-06-01&endDate=2025-06-30&interval=day`
- `/stats/revenue-by-route?startDate=2025-06-01&endDate=2025-06-30`

### Phản hồi
`200 OK` với cấu trúc:
```json
{
  "success": true,
  "data": [ /* số liệu */ ]
}
```

## 14. API Loại máy bay
| Phương thức | Endpoint | Quyền | Mô tả |
|-------------|----------|-------|-------|
|`GET`|`/aircraft-types`|Công khai|Danh sách loại máy bay.|
|`GET`|`/aircraft-types/:id`|Công khai|Chi tiết loại máy bay.|
|`POST`|`/aircraft-types`|Admin|Tạo loại máy bay.|
|`PUT`|`/aircraft-types/:id`|Admin|Cập nhật loại máy bay.|
|`DELETE`|`/aircraft-types/:id`|Admin|Xoá loại máy bay.|

Tài liệu trên bao quát toàn bộ endpoint hiện có của hệ thống. Hãy gửi token qua header `Authorization: Bearer <token>` khi gọi các API yêu cầu xác thực.
