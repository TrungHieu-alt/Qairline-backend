import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:3000';

// Ánh xạ tên hiển thị hạng vé
const classTypeNames = {
  economy: 'Phổ thông',
  business: 'Thương gia',
  first: 'Hạng nhất'
};

// Ánh xạ classType sang class_name trong ticket_classes
const classTypeToName = {
  economy: 'Economy Class',
  business: 'Business Class',
  first: 'First Class'
};

// Hàm chuẩn hóa tên hạng vé
const normalizeClassName = (name) => {
  return name.toLowerCase().replace(/\s+/g, '');
};

// Hàm tính giá vé
const calculatePrice = (basePrice, ticketType) => {
  let price = basePrice || 0;
  if (ticketType.tripType === 'round-trip') price *= 2;
  if (ticketType.classType === 'business') price *= 1.5;
  else if (ticketType.classType === 'first') price *= 2;
  return price;
};

function Booking() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const flight = location.state?.flight || null;
  const ticketType = location.state?.ticketType || { tripType: 'one-way', classType: 'economy' };

  const [email, setEmail] = useState('');
  const [customer, setCustomer] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    seat_number: 'A1',
    gender: '',
    birth_date: '',
    identity_number: '',
    phone_number: '',
    address: '',
    country: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [ticketClasses, setTicketClasses] = useState([]);
  const [ticketCode, setTicketCode] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const displayPrice = calculatePrice(flight?.base_economy_class_price, ticketType);
  const cancellationDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString();

  // Lấy danh sách hạng vé
  useEffect(() => {
    const fetchTicketClasses = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/ticket-classes`);
        console.log('Ticket classes response:', res.data); // Debug
        const classes = res.data.data || [];
        if (!classes.length) {
          console.warn('No ticket classes found');
          setError('Không thể tải danh sách hạng vé. Vui lòng thử lại.');
        }
        setTicketClasses(classes);
      } catch (err) {
        console.error('Error fetching ticket classes:', err);
        setError('Không thể tải danh sách hạng vé: ' + err.message);
      }
    };
    fetchTicketClasses();
  }, []);

  // Cập nhật form khi có dữ liệu khách hàng
  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        password: '',
        seat_number: 'A1',
        gender: customer.gender || '',
        birth_date: customer.birth_date ? new Date(customer.birth_date).toISOString().split('T')[0] : '',
        identity_number: customer.identity_number || '',
        phone_number: customer.phone_number || '',
        address: customer.address || '',
        country: customer.country || ''
      });
    }
  }, [customer]);

  // Xử lý nhập email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Checking email:', email);
      const res = await axios.get(`${API_URL}/api/check-email?email=${email}`);
      console.log('Check email response:', res.data);
      if (res.data.exists) {
        const customerRes = await axios.get(`${API_URL}/api/customer/by-email/${email}`);
        if (!customerRes.data.success) {
          throw new Error(customerRes.data.error || 'Không thể lấy thông tin khách hàng');
        }
        console.log('Customer data:', customerRes.data.data);
        setCustomer(customerRes.data.data);
        setIsNewCustomer(false);
      } else {
        setIsNewCustomer(true);
      }
      setStep(2);
    } catch (err) {
      console.error('Email check error:', err);
      setError('Không thể kiểm tra email: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Validate form trước khi submit
  const validateForm = () => {
    const errors = {};
    if (!formData.first_name) errors.first_name = 'Họ là bắt buộc';
    if (!formData.last_name) errors.last_name = 'Tên là bắt buộc';
    if (isNewCustomer && !formData.password) errors.password = 'Mật khẩu là bắt buộc';
    if (formData.gender && !['male', 'female', 'other'].includes(formData.gender)) {
      errors.gender = 'Giới tính không hợp lệ';
    }
    return errors;
  };

  // Xử lý nhập thông tin khách hàng
  const handleCustomerInfoSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setLoading(true);
    try {
      if (isNewCustomer) {
        const customerData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: email,
          password: formData.password,
          username: email.split('@')[0],
          gender: formData.gender || null,
          birth_date: formData.birth_date || null,
          identity_number: formData.identity_number || null,
          phone_number: formData.phone_number || null,
          address: formData.address || null,
          country: formData.country || null
        };
        console.log('Sending customer data:', customerData); // Debug
        const res = await axios.post(`${API_URL}/api/customer/register`, customerData);
        setCustomer(res.data.user);
      } else {
        setCustomer({
          ...customer,
          first_name: formData.first_name,
          last_name: formData.last_name,
          gender: formData.gender || null,
          birth_date: formData.birth_date,
          identity_number: formData.identity_number,
          phone_number: formData.phone_number,
          address: formData.address,
          country: formData.country
        });
      }
      navigate('/seat-selection', {
  state: { flight, ticketType, customer, formData }
      })
      setStep(3);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error?.includes('customers_gender_check')
        ? 'Giới tính không hợp lệ. Vui lòng chọn Nam, Nữ hoặc Khác.'
        : 'Không thể đăng ký: ' + (err.response?.data?.error || err.message);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xác nhận đặt vé
  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const targetClassName = classTypeToName[ticketType.classType] || 'Economy Class';
      const selectedClass = ticketClasses.find(cls => 
        normalizeClassName(cls.class_name) === normalizeClassName(targetClassName)
      );
      if (!selectedClass) {
        console.warn('No matching ticket class found for:', ticketType.classType);
        throw new Error('Hạng vé không hợp lệ');
      }

      const ticketData = {
        flight_id: flightId,
        customer_id: customer.id,
        ticket_class_id: selectedClass.id,
        seat_number: formData.seat_number || 'A1',
        cancellation_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        price: displayPrice
      };
      console.log('Sending ticket data:', ticketData);
      const response = await axios.post(`${API_URL}/api/tickets/book`, ticketData);
      console.log('Booking response:', response.data);
      setTicketCode(response.data.ticket.ticket_code); // Lưu mã code
      alert('Đặt vé thành công!');
      setStep(4); // Chuyển sang bước hiển thị mã code
    } catch (err) {
      console.error('Booking error:', err);
      setError('Đặt vé thất bại: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: null }); // Xóa lỗi khi người dùng nhập
  };

  if (!flight) return <div className="text-center p-4">Không tìm thấy chuyến bay</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-6 bg-green-50 min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-600 text-center">Đặt Vé Chuyến Bay</h1>
      {error && (
        <div className="text-center p-4 text-red-600 bg-red-100 rounded-lg mb-6 shadow-md">
          {error}
          <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
        </div>
      )}

      {/* Bước 1: Nhập email */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <h2 className="text-2xl font-semibold mb-6 text-green-600 border-b border-green-200 pb-2">Thông Tin Chuyến Bay</h2>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Số hiệu chuyến bay</p>
              <p className="font-semibold text-green-800">{flight.flight_number || 'N/A'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-2">
              <p className="text-sm text-gray-600">Hạng vé</p>
              <p className="font-semibold text-green-800">{classTypeNames[ticketType.classType] || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Điểm đi</p>
                <p className="font-semibold text-green-800">{flight.departure_airport_name || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Địa điểm đến</p>
                <p className="font-semibold text-green-800">{flight.arrival_airport_name || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Thời gian khởi hành</p>
                <p className="font-semibold text-green-800">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Thời gian đến</p>
                <p className="font-semibold text-green-800">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-2">
              <p className="text-sm text-gray-600">Giá vé</p>
              <p className="font-semibold text-green-600">{displayPrice.toLocaleString()} VND</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <h2 className="text-2xl font-semibold mb-6 text-green-600 border-b border-green-200 pb-2">Nhập Email Của Bạn</h2>
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition font-semibold"
                disabled={loading}
              >
                {loading ? 'Đang kiểm tra...' : 'Tiếp tục'}
              </motion.button>
            </form>
          </div>
        </div>
      )}

      {/* Bước 2: Nhập thông tin khách hàng */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <h2 className="text-2xl font-semibold mb-6 text-green-600 border-b border-green-200 pb-2">Thông Tin Chuyến Bay</h2>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Số hiệu chuyến bay</p>
              <p className="font-semibold text-green-800">{flight.flight_number || 'N/A'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-2">
              <p className="text-sm text-gray-600">Hạng vé</p>
              <p className="font-semibold text-green-800">{classTypeNames[ticketType.classType] || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Điểm đi</p>
                <p className="font-semibold text-green-800">{flight.departure_airport_name || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Địa điểm đến</p>
                <p className="font-semibold text-green-800">{flight.arrival_airport_name || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Thời gian khởi hành</p>
                <p className="font-semibold text-green-800">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Thời gian đến</p>
                <p className="font-semibold text-green-800">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-2">
              <p className="text-sm text-gray-600">Giá vé</p>
              <p className="font-semibold text-green-600">{displayPrice.toLocaleString()} VND</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <h2 className="text-2xl font-semibold mb-6 text-green-600 border-b border-green-200 pb-2">{isNewCustomer ? 'Đăng Ký Tài Khoản' : 'Thông Tin Hành Khách'}</h2>
            <form onSubmit={handleCustomerInfoSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Họ</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                    required
                  />
                  {formErrors.first_name && <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Tên</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                    required
                  />
                  {formErrors.last_name && <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>}
                </div>
                {isNewCustomer && (
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Mật khẩu</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                      required
                    />
                    {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Giới tính</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-600 font-medium mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-600 font-medium mb-1">Số CMND/CCCD</label>
                  <input
                    type="text"
                    name="identity_number"
                    value={formData.identity_number}
                    onChange={handleInputChange}
                    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-600 font-medium mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
                <div className="mb-4 col-span-2">
                  <label className="block text-gray-600 font-medium mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
                <div className="mb-4 col-span-2">
                  <label className="block text-gray-600 font-medium mb-1">Quốc gia</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
                <div className="mb-4 col-span-2">
                  <label className="block text-gray-600 font-medium mb-1">Số ghế (mặc định A1)</label>
                  <input
                    type="text"
                    name="seat_number"
                    value={formData.seat_number}
                    onChange={handleInputChange}
                    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition font-semibold"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
              </motion.button>
            </form>
          </div>
        </div>
      )}

      {step === 3 && (
  <div className="max-w-3xl mx-auto">
    <h2 className="text-2xl font-semibold mb-6 text-green-600 text-center">Xác Nhận Đặt Vé</h2>
    <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 relative">
      {/* Viền cắt đầu vé */}
      <div className="absolute top-0 left-0 right-0 h-4 border-b-2 border-dashed border-green-200"></div>
      {/* Logo giả */}
      <div className="flex justify-between items-center mb-4 pt-6">
        <img src="/path/to/logo.png" alt="AirGrok" className="h-8" />
        <div className="text-sm text-gray-600">Mã vé: {ticketCode || 'Chờ xác nhận'}</div>
      </div>
      {/* Thông tin vé */}
      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-7 bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Chuyến Bay</h3>
          <p className="text-sm text-gray-600 font-light">Số hiệu chuyến bay: <span className="font-semibold text-green-800">{flight.flight_number || 'N/A'}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Hạng vé: <span className="font-semibold text-green-800">{classTypeNames[ticketType.classType] || 'N/A'}</span></p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <p className="text-sm text-gray-600 font-light">Điểm đi: <span className="font-semibold text-green-800">{flight.departure_airport_name || 'N/A'}</span></p>
              <span className="mx-2 text-green-600">⇒</span>
              <p className="text-sm text-gray-600 font-light">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-gray-600 font-light">Điểm đến: <span className="font-semibold text-green-800">{flight.arrival_airport_name || 'N/A'}</span></p>
              <span className="mx-2 text-green-600">⇒</span>
              <p className="text-sm text-gray-600 font-light">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="col-span-3 bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Chi Tiết Vé</h3>
          <p className="text-sm text-gray-600 font-light">Hành khách: <span className="font-semibold text-green-800">{customer.first_name} {customer.last_name}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Email: <span className="font-semibold text-green-800">{email}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Số ghế: <span className="font-semibold text-green-800">{formData.seat_number || 'A1'}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Giá vé: <span className="font-semibold text-green-600">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Hạn hủy vé: <span className="font-semibold text-green-800">{cancellationDeadline}</span></p>
        </div>
      </div>
      {/* Box thông tin người đặt vé */}
      <div className="mt-4 bg-green-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Người Đặt Vé</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 font-light">Họ tên: <span className="font-semibold text-green-800">{customer.first_name} {customer.last_name}</span></p>
            <p className="text-sm text-gray-600 font-light mt-2">Email: <span className="font-semibold text-green-800">{email}</span></p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-light">Số điện thoại: <span className="font-semibold text-green-800">{formData.phone_number || 'N/A'}</span></p>
            <p className="text-sm text-gray-600 font-light mt-2">Số CMND/CCCD: <span className="font-semibold text-green-800">{formData.identity_number || 'N/A'}</span></p>
          </div>
        </div>
      </div>
      {/* Mã vạch giả */}
      <div className="mt-4 flex justify-center">
        <div className="h-8 w-48 bg-gray-200 flex">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`h-full ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`} style={{ width: `${Math.random() * 3 + 1}px` }}></div>
          ))}
        </div>
      </div>
      {/* Viền cắt cuối vé */}
      <div className="absolute bottom-0 left-0 right-0 h-4 border-t-2 border-dashed border-green-200"></div>
      {/* Nút xác nhận */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleConfirmBooking}
        className="bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition font-semibold mt-6"
        disabled={loading}
      >
        {loading ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
      </motion.button>
    </div>
  </div>
)}

{step === 4 && (
  <div className="max-w-3xl mx-auto">
    <h2 className="text-2xl font-semibold mb-6 text-green-600 text-center">Đặt Vé Thành Công!</h2>
    <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 relative">
      {/* Viền cắt đầu vé */}
      <div className="absolute top-0 left-0 right-0 h-4 border-b-2 border-dashed border-green-200"></div>
      {/* Logo giả */}
      <div className="flex justify-between items-center mb-4 pt-6">
        <img src="/path/to/logo.png" alt="AirGrok" className="h-8" />
        <div className="text-sm text-gray-600">Mã vé: {ticketCode}</div>
      </div>
      {/* Thông tin vé */}
      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-7 bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Chuyến Bay</h3>
          <p className="text-sm text-gray-600 font-light">Số hiệu chuyến bay: <span className="font-semibold text-green-800">{flight.flight_number || 'N/A'}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Hạng vé: <span className="font-semibold text-green-800">{classTypeNames[ticketType.classType] || 'N/A'}</span></p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <p className="text-sm text-gray-600 font-light">Điểm đi: <span className="font-semibold text-green-800">{flight.departure_airport_name || 'N/A'}</span></p>
              <span className="mx-2 text-green-600">⇒</span>
              <p className="text-sm text-gray-600 font-light">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-gray-600 font-light">Điểm đến: <span className="font-semibold text-green-800">{flight.arrival_airport_name || 'N/A'}</span></p>
              <span className="mx-2 text-green-600">⇒</span>
              <p className="text-sm text-gray-600 font-light">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="col-span-3 bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Chi Tiết Vé</h3>
          <p className="text-sm text-gray-600 font-light">Hành khách: <span className="font-semibold text-green-800">{customer.first_name} {customer.last_name}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Email: <span className="font-semibold text-green-800">{email}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Số ghế: <span className="font-semibold text-green-800">{formData.seat_number || 'A1'}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Giá vé: <span className="font-semibold text-green-600">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Hạn hủy vé: <span className="font-semibold text-green-800">{cancellationDeadline}</span></p>
        </div>
      </div>
      {/* Box thông tin người đặt vé */}
      <div className="mt-4 bg-green-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Người Đặt Vé</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 font-light">Họ tên: <span className="font-semibold text-green-800">{customer.first_name} {customer.last_name}</span></p>
            <p className="text-sm text-gray-600 font-light mt-2">Email: <span className="font-semibold text-green-800">{email}</span></p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-light">Số điện thoại: <span className="font-semibold text-green-800">{formData.phone_number || 'N/A'}</span></p>
            <p className="text-sm text-gray-600 font-light mt-2">Số CMND/CCCD: <span className="font-semibold text-green-800">{formData.identity_number || 'N/A'}</span></p>
          </div>
        </div>
      </div>
      {/* Mã vạch giả */}
      <div className="mt-4 flex justify-center">
        <div className="h-8 w-48 bg-gray-200 flex">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`h-full ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`} style={{ width: `${Math.random() * 3 + 1}px` }}></div>
          ))}
        </div>
      </div>
      {/* Viền cắt cuối vé */}
      <div className="absolute bottom-0 left-0 right-0 h-4 border-t-2 border-dashed border-green-200"></div>
      {/* Nút chuyển hướng */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/tickets')}
        className="bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition font-semibold mt-6"
      >
        Đi đến trang Vé của tôi
      </motion.button>
    </div>
  </div>
)}
    </motion.div>
  );
}

export default Booking;