import { useState, useEffect } from 'react';
import { createAircraft, getAircrafts, getAirlines } from '../../services/api';
import { motion } from 'framer-motion';

function AdminAircrafts() {
  const [formData, setFormData] = useState({
    airline_id: '',
    aircraft_type: '',
    custom_aircraft_type: '',
    total_first_class_seats: '',
    total_business_class_seats: '',
    total_economy_class_seats: '',
    status: '',
    aircraft_code: '',
    manufacturer: '',
    custom_manufacturer: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [aircrafts, setAircrafts] = useState([]);
  const [airlines, setAirlines] = useState([]);

  const aircraftTypes = [
    'Airbus A321-200',
    'Boeing 787-9 Dreamliner',
    'ATR 72',
    'Airbus A330-200',
    'Airbus A350-900 XWB',
    'Boeing 777',
    'Boeing 737',
    'khác'
  ];

  const manufacturers = ['Airbus', 'Boeing', 'ATR', 'khác'];

  const statuses = ['Active', 'Maintenance', 'Retired'];

  const fetchAircrafts = async () => {
    try {
      const res = await getAircrafts();
      setAircrafts(res.data.data || []);
    } catch (err) {
      console.log('❌ Lỗi lấy danh sách aircraft:', err);
      setError('Không thể tải danh sách aircraft: ' + err.message);
    }
  };

  const fetchAirlines = async () => {
    try {
      const res = await getAirlines();
      setAirlines(res.data.data || []);
    } catch (err) {
      console.log('❌ Lỗi lấy danh sách airlines:', err);
      setError('Không thể tải danh sách hãng hàng không: ' + err.message);
    }
  };

  useEffect(() => {
    fetchAircrafts();
    fetchAirlines();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    console.log('📊 Token gửi lên:', token);
    const dataToSubmit = {
      ...formData,
      aircraft_type: formData.aircraft_type === 'khác' ? formData.custom_aircraft_type : formData.aircraft_type,
      manufacturer: formData.manufacturer === 'khác' ? formData.custom_manufacturer : formData.manufacturer
    };
    console.log('📊 Dữ liệu gửi lên:', dataToSubmit);
    const res = await createAircraft(dataToSubmit);
    setSuccess('Tạo aircraft thành công!');
    setFormData({
      airline_id: '',
      aircraft_type: '',
      custom_aircraft_type: '',
      total_first_class_seats: '',
      total_business_class_seats: '',
      total_economy_class_seats: '',
      status: '',
      aircraft_code: '',
      manufacturer: '',
      custom_manufacturer: ''
    });
    fetchAircrafts();
  } catch (err) {
    console.log('❌ Lỗi tạo aircraft:', err);
    if (err.response && err.response.status === 400) {
      setError(err.response.data.error || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
    } else if (err.response && err.response.status === 403) {
      setError('Không có quyền truy cập. Vui lòng kiểm tra vai trò của bạn.');
    } else {
      setError('Tạo aircraft thất bại: ' + err.message);
    }
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-4"
    >
      <h1 className="text-2xl font-bold mb-4 text-green-600">Quản lý Aircraft</h1>
      {error && (
        <div className="text-center p-4 text-red-500">
          {error}
          <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
        </div>
      )}
      {success && (
        <div className="text-center p-4 text-green-500">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mb-8">
        <div>
          <label className="block text-gray-700 mb-2">Hãng Hàng Không</label>
          <select
            name="airline_id"
            value={formData.airline_id}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Chọn hãng hàng không</option>
            {airlines.map(airline => (
              <option key={airline.id} value={airline.id}>
                {airline.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Loại Máy Bay</label>
          <select
            name="aircraft_type"
            value={formData.aircraft_type}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Chọn loại máy bay</option>
            {aircraftTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {formData.aircraft_type === 'khác' && (
            <input
              type="text"
              name="custom_aircraft_type"
              value={formData.custom_aircraft_type}
              onChange={handleChange}
              className="mt-2 p-2 border rounded w-full"
              placeholder="Nhập loại máy bay"
              required
            />
          )}
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Số Ghế Hạng Nhất</label>
          <input
            type="number"
            name="total_first_class_seats"
            value={formData.total_first_class_seats}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Số Ghế Hạng Thương Gia</label>
          <input
            type="number"
            name="total_business_class_seats"
            value={formData.total_business_class_seats}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Số Ghế Hạng Phổ Thông</label>
          <input
            type="number"
            name="total_economy_class_seats"
            value={formData.total_economy_class_seats}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Trạng Thái</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Chọn trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Mã Máy Bay</label>
          <input
            type="text"
            name="aircraft_code"
            value={formData.aircraft_code}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Nhà Sản Xuất</label>
          <select
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Chọn nhà sản xuất</option>
            {manufacturers.map(manufacturer => (
              <option key={manufacturer} value={manufacturer}>
                {manufacturer}
              </option>
            ))}
          </select>
          {formData.manufacturer === 'khác' && (
            <input
              type="text"
              name="custom_manufacturer"
              value={formData.custom_manufacturer}
              onChange={handleChange}
              className="mt-2 p-2 border rounded w-full"
              placeholder="Nhập nhà sản xuất"
              required
            />
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition w-full"
        >
          Tạo Aircraft
        </motion.button>
      </form>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-green-600">Danh sách Aircraft</h2>
        {aircrafts.length === 0 ? (
          <p className="text-gray-600">Chưa có aircraft nào.</p>
        ) : (
          <ul className="space-y-2">
            {aircrafts.map(aircraft => (
              <li key={aircraft.id} className="p-4 border rounded">
                <p><strong>Mã Máy Bay:</strong> {aircraft.aircraft_code}</p>
                <p><strong>Loại Máy Bay:</strong> {aircraft.aircraft_type}</p>
                <p><strong>Nhà Sản Xuất:</strong> {aircraft.manufacturer}</p>
                <p><strong>Trạng Thái:</strong> {aircraft.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

export default AdminAircrafts;