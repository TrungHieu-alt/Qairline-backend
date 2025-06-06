import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Hàm tiện ích để lấy header xác thực
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Hàm kiểm tra vai trò admin
const checkAdminRole = () => {
  const role = localStorage.getItem('role');
  if (role !== 'admin') {
    throw new Error('Yêu cầu quyền admin để thực hiện hành động này');
  }
};

// Hàm xử lý lỗi chung
const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message;
  throw new Error(`Lỗi API: ${message}`);
};

// API Xác thực
/**
 * Đăng ký hành khách mới
 * @param {Object} data - Dữ liệu đăng ký (email, password, first_name, last_name, phone_number)
 * @returns {Promise} Promise trả về token và thông tin người dùng
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const registerCustomer = async (data) => {
  try {
    const payload = {
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      phoneNumber: data.phone_number,
    };
    const response = await axios.post(`${API_URL}/auth/register`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    // Lưu token và role vào localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user_id', response.data.user?.id);
      localStorage.setItem('role', response.data.user?.role);
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Đăng nhập hành khách
 * @param {Object} data - Dữ liệu đăng nhập (email, password)
 * @returns {Promise} Promise trả về token và thông tin người dùng
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const loginCustomer = async (data) => {
  try {
    const payload = { email: data.email, password: data.password };
    const response = await axios.post(`${API_URL}/auth/login`, payload, { headers: getAuthHeaders() });
    // Lưu token và role vào localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user_id', response.data.user?.id);
      localStorage.setItem('role', response.data.user?.role);
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Chuyến bay
/**
 * Lấy danh sách tất cả chuyến bay
 * @returns {Promise} Promise trả về danh sách chuyến bay
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getFlights = async () => {
  try {
    const response = await axios.get(`${API_URL}/flights`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Tìm chuyến bay theo chặng
 * @param {Object} data - Dữ liệu tìm kiếm (legs: [{from_airport_id, to_airport_id, date}])
 * @returns {Promise} Promise trả về danh sách chuyến bay phù hợp
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const searchFlights = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/flights/search`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy chi tiết chuyến bay
 * @param {string} flightId - ID chuyến bay
 * @returns {Promise} Promise trả về chi tiết chuyến bay
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getFlight = async (flightId) => {
  try {
    const response = await axios.get(`${API_URL}/flights/${flightId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Dời thời gian chuyến bay
 * @param {string} id - ID chuyến bay
 * @param {Object} data - Dữ liệu cập nhật (departure_time, arrival_time)
 * @returns {Promise} Promise trả về thông tin chuyến bay đã cập nhật
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const delayFlight = async (id, data) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/flights/${id}/delay`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Tạo chuyến bay mới
 * @param {Object} data - Dữ liệu chuyến bay (aircraft_id, source_airport_id, destination_airport_id, departure_time, arrival_time)
 * @returns {Promise} Promise trả về thông tin chuyến bay đã tạo
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const createFlight = async (data) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/flights`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Hủy chuyến bay
 * @param {string} id - ID chuyến bay
 * @returns {Promise} Promise trả về thông tin chuyến bay đã hủy
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const cancelFlight = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/flights/${id}/cancel`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Xóa chuyến bay
 * @param {string} id - ID chuyến bay
 * @returns {Promise} Promise trả về thông báo xóa thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const deleteFlight = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.delete(`${API_URL}/flights/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Đặt chỗ
/**
 * Tạo đặt chỗ mới
 * @param {Object} data - Dữ liệu đặt chỗ (passenger_id, seat_id, payment)
 * @returns {Promise} Promise trả về thông tin đặt chỗ đã tạo
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const bookTicket = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/reservations`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Hủy đặt chỗ
 * @param {string} id - ID đặt chỗ
 * @returns {Promise} Promise trả về thông báo hủy thành công
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const cancelTicket = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/reservations/${id}/cancel`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy danh sách đặt chỗ của hành khách
 * @returns {Promise} Promise trả về danh sách đặt chỗ
 * @throws {Error} Nếu không tìm thấy passengerId hoặc yêu cầu thất bại
 */
export const getTickets = async () => {
  try {
    const passengerId = localStorage.getItem('passengerId');
    if (!passengerId) {
      throw new Error('Không tìm thấy passengerId trong localStorage');
    }
    const response = await axios.get(`${API_URL}/passengers/${passengerId}/reservations`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy chi tiết đặt chỗ
 * @param {string} id - ID đặt chỗ
 * @returns {Promise} Promise trả về chi tiết đặt chỗ
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getReservation = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reservations/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Hành khách
/**
 * Tạo hành khách mới
 * @param {Object} data - Dữ liệu hành khách (first_name, last_name, email, phone_number, address, city, state, zipcode, country)
 * @returns {Promise} Promise trả về thông tin hành khách đã tạo
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const createPassenger = async (data) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/passengers`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy chi tiết hành khách
 * @param {string} id - ID hành khách
 * @returns {Promise} Promise trả về chi tiết hành khách
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getPassenger = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/passengers/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Cập nhật hành khách
 * @param {string} id - ID hành khách
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Promise trả về thông tin hành khách đã cập nhật
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const updatePassenger = async (id, data) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/passengers/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Xóa hành khách
 * @param {string} id - ID hành khách
 * @returns {Promise} Promise trả về thông báo xóa thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const deletePassenger = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.delete(`${API_URL}/passengers/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Liên kết hành khách với người dùng
 * @param {string} passengerId - ID hành khách
 * @param {string} userId - ID người dùng
 * @returns {Promise} Promise trả về thông báo liên kết thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const linkPassengerToUser = async (passengerId, userId) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/passengers/${passengerId}/link-user/${userId}`, {}, { headers: getAuthHeaders() });
    // Lưu passengerId vào localStorage nếu liên kết thành công
    if (response.data.passengerId) {
      localStorage.setItem('passengerId', response.data.passengerId);
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Thông báo
/**
 * Lấy danh sách thông báo
 * @returns {Promise} Promise trả về danh sách thông báo
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getAnnouncements = async () => {
  try {
    const response = await axios.get(`${API_URL}/announcements`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Tạo thông báo mới
 * @param {Object} data - Dữ liệu thông báo (title, content, type, status, start_date, end_date, priority)
 * @returns {Promise} Promise trả về thông tin thông báo đã tạo
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const createAnnouncement = async (data) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/announcements`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Cập nhật thông báo
 * @param {string} id - ID thông báo
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Promise trả về thông tin thông báo đã cập nhật
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const updateAnnouncement = async (id, data) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/announcements/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Xóa thông báo
 * @param {string} id - ID thông báo
 * @returns {Promise} Promise trả về thông báo xóa thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const deleteAnnouncement = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.delete(`${API_URL}/announcements/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Máy bay
/**
 * Lấy danh sách máy bay
 * @returns {Promise} Promise trả về danh sách máy bay
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getAircrafts = async () => {
  try {
    const response = await axios.get(`${API_URL}/aircrafts`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy chi tiết máy bay
 * @param {string} id - ID máy bay
 * @returns {Promise} Promise trả về chi tiết máy bay
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getAircraftById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/aircrafts/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Tạo máy bay mới
 * @param {Object} data - Dữ liệu máy bay (airline_id, aircraft_type_id, registration_number)
 * @returns {Promise} Promise trả về thông tin máy bay đã tạo
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const createAircraft = async (data) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/aircrafts`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Cập nhật máy bay
 * @param {string} id - ID máy bay
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Promise trả về thông tin máy bay đã cập nhật
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const updateAircraft = async (id, data) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/aircrafts/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Xóa máy bay
 * @param {string} id - ID máy bay
 * @returns {Promise} Promise trả về thông báo xóa thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const deleteAircraft = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.delete(`${API_URL}/aircrafts/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Hạng ghế
/**
 * Lấy danh sách hạng ghế
 * @returns {Promise} Promise trả về danh sách hạng ghế
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getTicketClasses = async () => {
  try {
    const response = await axios.get(`${API_URL}/ticket-classes`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Tạo hạng ghế mới
 * @param {Object} data - Dữ liệu hạng ghế (name, description)
 * @returns {Promise} Promise trả về thông tin hạng ghế đã tạo
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const createTicketClass = async (data) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/ticket-classes`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Cập nhật hạng ghế
 * @param {string} id - ID hạng ghế
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Promise trả về thông tin hạng ghế đã cập nhật
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const updateTicketClass = async (id, data) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/ticket-classes/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Xóa hạng ghế
 * @param {string} id - ID hạng ghế
 * @returns {Promise} Promise trả về thông báo xóa thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const deleteTicketClass = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.delete(`${API_URL}/ticket-classes/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy danh sách dịch vụ của hạng ghế
 * @returns {Promise} Promise trả về danh sách dịch vụ
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getPerksForTicketClass = async () => {
  try {
    const response = await axios.get(`${API_URL}/service-offerings`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Dịch vụ trên hạng ghế
/**
 * Lấy danh sách dịch vụ
 * @returns {Promise} Promise trả về danh sách dịch vụ
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getServiceOfferings = async () => {
  try {
    const response = await axios.get(`${API_URL}/service-offerings`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy chi tiết dịch vụ theo hạng ghế và ID dịch vụ
 * @param {string} travelClassId - ID hạng ghế
 * @param {string} serviceId - ID dịch vụ
 * @returns {Promise} Promise trả về chi tiết dịch vụ
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getServiceOfferingById = async (travelClassId, serviceId) => {
  try {
    const response = await axios.get(`${API_URL}/service-offerings/${travelClassId}/${serviceId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Tạo dịch vụ mới cho hạng ghế
 * @param {Object} data - Dữ liệu dịch vụ (travel_class_id, service_id, is_offered, from_month, to_month)
 * @returns {Promise} Promise trả về thông tin dịch vụ đã tạo
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const createServiceOffering = async (data) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/service-offerings`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Cập nhật dịch vụ
 * @param {string} travelClassId - ID hạng ghế
 * @param {string} serviceId - ID dịch vụ
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Promise trả về thông tin dịch vụ đã cập nhật
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const updateServiceOffering = async (travelClassId, serviceId, data) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/service-offerings/${travelClassId}/${serviceId}`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Xóa dịch vụ
 * @param {string} travelClassId - ID hạng ghế
 * @param {string} serviceId - ID dịch vụ
 * @returns {Promise} Promise trả về thông báo xóa thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const deleteServiceOffering = async (travelClassId, serviceId) => {
  try {
    checkAdminRole();
    const response = await axios.delete(`${API_URL}/service-offerings/${travelClassId}/${serviceId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Bảng điều khiển Admin
/**
 * Lấy số liệu tổng quan admin
 * @returns {Promise} Promise trả về số liệu tổng quan
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getAdminStats = async () => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/stats`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy danh sách đặt chỗ gần đây
 * @returns {Promise} Promise trả về danh sách đặt chỗ
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getRecentBookings = async () => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/recent-bookings`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy danh sách chuyến bay sắp khởi hành
 * @returns {Promise} Promise trả về danh sách chuyến bay
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getUpcomingFlights = async () => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/upcoming-flights`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy xu hướng đặt vé
 * @returns {Promise} Promise trả về dữ liệu xu hướng
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getBookingTrends = async () => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/booking-trends`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy doanh thu theo thời gian
 * @returns {Promise} Promise trả về dữ liệu doanh thu
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getRevenueByTime = async () => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/stats/revenue-by-time`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy doanh thu theo tuyến bay
 * @returns {Promise} Promise trả về dữ liệu doanh thu
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getRevenueByRoute = async () => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/stats/revenue-by-route`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy doanh thu theo hãng bay
 * @returns {Promise} Promise trả về dữ liệu doanh thu
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getRevenueByAirline = async () => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/stats/revenue-by-airline`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy doanh thu theo hạng ghế
 * @returns {Promise} Promise trả về dữ liệu doanh thu
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getRevenueByTravelClass = async () => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/stats/revenue-by-travel-class`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Thành phố
/**
 * Lấy danh sách thành phố
 * @returns {Promise} Promise trả về danh sách thành phố
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getCities = async () => {
  try {
    const response = await axios.get(`${API_URL}/cities`, {
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy chi tiết thành phố
 * @param {string} id - ID thành phố
 * @returns {Promise} Promise trả về chi tiết thành phố
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getCityById = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/cities/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Tạo thành phố mới
 * @param {Object} data - Dữ liệu thành phố (name, country_id)
 * @returns {Promise} Promise trả về thông tin thành phố đã tạo
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const createCity = async (data) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/cities`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Cập nhật thành phố
 * @param {string} id - ID thành phố
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Promise trả về thông tin thành phố đã cập nhật
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const updateCity = async (id, data) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/cities/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Xóa thành phố
 * @param {string} id - ID thành phố
 * @returns {Promise} Promise trả về thông báo xóa thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const deleteCity = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.delete(`${API_URL}/cities/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Quốc gia
/**
 * Lấy danh sách quốc gia
 * @returns {Promise} Promise trả về danh sách quốc gia
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getCountries = async () => {
  try {
    const response = await axios.get(`${API_URL}/countries`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy chi tiết quốc gia
 * @param {string} id - ID quốc gia
 * @returns {Promise} Promise trả về chi tiết quốc gia
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const getCountryById = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.get(`${API_URL}/countries/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Tạo quốc gia mới
 * @param {Object} data - Dữ liệu quốc gia (name, code)
 * @returns {Promise} Promise trả về thông tin quốc gia đã tạo
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const createCountry = async (data) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/countries`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Cập nhật quốc gia
 * @param {string} id - ID quốc gia
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Promise trả về thông tin quốc gia đã cập nhật
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const updateCountry = async (id, data) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/countries/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Xóa quốc gia
 * @param {string} id - ID quốc gia
 * @returns {Promise} Promise trả về thông báo xóa thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const deleteCountry = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.delete(`${API_URL}/countries/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Hãng hàng không
/**
 * Lấy danh sách hãng hàng không
 * @returns {Promise} Promise trả về danh sách hãng hàng không
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getAirlines = async () => {
  try {
    const response = await axios.get(`${API_URL}/airlines`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Tạo hãng hàng không mới
 * @param {Object} data - Dữ liệu hãng hàng không (name, code)
 * @returns {Promise} Promise trả về thông tin hãng hàng không đã tạo
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const createAirline = async (data) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/airlines`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Cập nhật hãng hàng không
 * @param {string} id - ID hãng hàng không
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Promise trả về thông tin hãng hàng không đã cập nhật
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const updateAirline = async (id, data) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/airlines/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Xóa hãng hàng không
 * @param {string} id - ID hãng hàng không
 * @returns {Promise} Promise trả về thông báo xóa thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const deleteAirline = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.delete(`${API_URL}/airlines/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// API Sân bay
/**
 * Lấy danh sách sân bay
 * @returns {Promise} Promise trả về danh sách sân bay
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getAirports = async () => {
  try {
    const response = await axios.get(`${API_URL}/airports`, {
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Lấy chi tiết sân bay
 * @param {string} id - ID sân bay
 * @returns {Promise} Promise trả về chi tiết sân bay
 * @throws {Error} Nếu yêu cầu thất bại
 */
export const getAirportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/airports/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Tạo sân bay mới
 * @param {Object} data - Dữ liệu sân bay (name, code, city_id)
 * @returns {Promise} Promise trả về thông tin sân bay đã tạo
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const createAirport = async (data) => {
  try {
    checkAdminRole();
    const response = await axios.post(`${API_URL}/airports`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Cập nhật sân bay
 * @param {string} id - ID sân bay
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Promise trả về thông tin sân bay đã cập nhật
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const updateAirport = async (id, data) => {
  try {
    checkAdminRole();
    const response = await axios.put(`${API_URL}/airports/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Xóa sân bay
 * @param {string} id - ID sân bay
 * @returns {Promise} Promise trả về thông báo xóa thành công
 * @throws {Error} Nếu yêu cầu thất bại hoặc không có quyền admin
 */
export const deleteAirport = async (id) => {
  try {
    checkAdminRole();
    const response = await axios.delete(`${API_URL}/airports/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};