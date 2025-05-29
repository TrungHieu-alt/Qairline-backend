# QAirline Backend API Documentation

## Giới thiệu
Đây là tài liệu API của backend hệ thống QAirline. Backend sử dụng Node.js với Express để cung cấp các endpoint quản lý chuyến bay, vé, khách hàng, thông báo và xác thực người dùng.

---

## Base URL
http://localhost:3000/api
## Flight APIs

| Method | Endpoint               | Mô tả                              |
|--------|------------------------|-----------------------------------|
| GET    | `/flights`             | Lấy danh sách tất cả chuyến bay   |
| GET    | `/flights/:id`         | Lấy thông tin chuyến bay theo ID  |
| `POST` | `/flights/search`   | Tìm kiếm chuyến bay một chiều, khứ hồi, hoặc nhiều chặng (multi-city) thông qua `body JSON` |
| PUT    | `/flights/:id/delay`   | Cập nhật trạng thái hoãn chuyến bay theo ID |

---

## Ticket APIs

| Method | Endpoint               | Mô tả                             |
|--------|------------------------|----------------------------------|
| POST   | `/tickets`             | Đặt vé mới                       |
| PUT    | `/tickets/:id/cancel`  | Hủy vé theo ID vé                |
| GET    | `/tickets/track/:code` | Tra cứu vé theo mã vé            |

---

## Customer APIs

| Method | Endpoint               | Mô tả                             |
|--------|------------------------|----------------------------------|
| POST   | `/customers`           | Tạo khách hàng mới               |

---

## Auth APIs

| Method | Endpoint               | Mô tả                             |
|--------|------------------------|----------------------------------|
| POST   | `/auth/login`          | Đăng nhập (nhận token hoặc session) |

---

## Announcement APIs

| Method | Endpoint               | Mô tả                             |
|--------|------------------------|----------------------------------|
| GET    | `/announcements`       | Lấy danh sách thông báo          |
| POST   | `/announcements`       | Tạo thông báo mới                |

---

## Ticket Class APIs

| Method | Endpoint               | Mô tả                             |
|--------|------------------------|----------------------------------|
| GET    | `/ticket-classes`      | Lấy danh sách các loại vé         |

---
### Mô tả Body Request (JSON) cho các API
#### 1. Đặt vé mới - POST `/tickets`

```json
{
  "customerId": "string",
  "flightId": "string",
  "seat": "string"
}
```
#### 2. Tạo khách hàng mới - POST /customers
```json
{
  "name": "string",
  "email": "string",
  "phone": "string"
}
```
#### 3. Đăng nhập - POST /auth/login
```json
{
  "username": "string",
  "password": "string" 
}
```
#### 4. Tạo thông báo mới - POST /announcements
```json
{
   "title": "string",
  "content": "string"
}
```
#### 5. Cập nhật trạng thái hoãn chuyến bay - PUT /flights/:id/delay
```json
{
  "newDeparture": "2025-05-28T15:30:00Z",
  "newArrival": "2025-05-28T18:00:00Z"
}
```

#### 6. Tìm kiếm chuyến bay cho nhiều chặng - PUT /flights/:id/delay
```json
{
  "legs": [
    {
      "from_airport_id": "SGN",
      "to_airport_id": "HAN",
      "date": "2025-06-01"
    },
    {
      "from_airport_id": "HAN",
      "to_airport_id": "DAD",
      "date": "2025-06-05"
    }
  ]
} 
```
## Return
```json
{
  "success": true,
  "data": [
    [ /* Danh sách chuyến bay cho chặng 1 */ ],
    [ /* Danh sách chuyến bay cho chặng 2 */ ]
  ]
}
```