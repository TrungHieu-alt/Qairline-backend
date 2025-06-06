import { useState, useEffect } from 'react';
import { getFlights, createFlight, delayFlight, getAircrafts, getAirlines, getRoutes } from '../../services/api';
import { motion } from 'framer-motion';

function AdminFlights() {
  const [flights, setFlights] = useState([]);
  const [aircrafts, setAircrafts] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    airline_id: '',
    route_id: '',
    flight_number: '',
    aircraft_id: '',
    departure_time: '',
    arrival_time: '',
    base_economy_class_price: '',
    base_business_class_price: '', // Thêm trường
    base_first_class_price: '', // Thêm trường
    flight_status: 'Scheduled',
  });
  const [delayForm, setDelayForm] = useState({ flightId: '', newDeparture: '', newArrival: '' });

  useEffect(() => {
    setLoading(true);

    const fetchFlights = async () => {
      try {
        const flightsRes = await getFlights();
        console.log('📊 Dữ liệu chuyến bay:', flightsRes);
        setFlights(Array.isArray(flightsRes.data?.data) ? flightsRes.data.data : []);
      } catch (err) {
        console.log('❌ Lỗi khi lấy danh sách chuyến bay:', err);
        setError('Không thể tải danh sách chuyến bay: ' + err.message);
      }
    };

    const fetchAircrafts = async () => {
      try {
        const aircraftsRes = await getAircrafts();
        console.log('📊 Dữ liệu tàu bay:', aircraftsRes);
        setAircrafts(Array.isArray(aircraftsRes.data?.data) ? aircraftsRes.data.data : []);
      } catch (err) {
        console.log('❌ Lỗi khi lấy danh sách tàu bay:', err);
        setError('Không thể tải danh sách tàu bay: ' + err.message);
      }
    };

    const fetchAirlines = async () => {
      try {
        const airlinesRes = await getAirlines();
        console.log('📊 Dữ liệu hãng hàng không:', airlinesRes);
        setAirlines(Array.isArray(airlinesRes.data?.data) ? airlinesRes.data.data : []);
      } catch (err) {
        console.log('❌ Lỗi khi lấy danh sách hãng hàng không:', err);
        setError('Không thể tải danh sách hãng hàng không: ' + err.message);
      }
    };

    const fetchRoutes = async () => {
      try {
        const routesRes = await getRoutes();
        console.log('📊 Dữ liệu tuyến bay:', routesRes);
        setRoutes(Array.isArray(routesRes.data?.data) ? routesRes.data.data : []);
      } catch (err) {
        console.log('❌ Lỗi khi lấy danh sách tuyến bay:', err);
        setError('Không thể tải danh sách tuyến bay: ' + err.message);
      }
    };

    const fetchAllData = async () => {
      await Promise.all([
        fetchFlights(),
        fetchAircrafts(),
        fetchAirlines(),
        fetchRoutes()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuyển đổi định dạng departure_time và arrival_time sang ISO 8601
      const departureTimeISO = new Date(form.departure_time).toISOString();
      const arrivalTimeISO = new Date(form.arrival_time).toISOString();

      // Kiểm tra departure_time < arrival_time
      if (new Date(departureTimeISO) >= new Date(arrivalTimeISO)) {
        throw new Error('Giờ khởi hành phải nhỏ hơn giờ đến.');
      }

      // Ép kiểu các giá trị giá vé sang số
      const baseEconomyPrice = parseFloat(form.base_economy_class_price);
      const baseBusinessPrice = parseFloat(form.base_business_class_price) || 0; // Mặc định 0 nếu không nhập
      const baseFirstClassPrice = parseFloat(form.base_first_class_price) || 0; // Mặc định 0 nếu không nhập

      // Kiểm tra giá trị hợp lệ
      if (isNaN(baseEconomyPrice)) {
        throw new Error('Giá vé phổ thông phải là một số hợp lệ.');
      }
      if (isNaN(baseBusinessPrice)) {
        throw new Error('Giá vé thương gia phải là một số hợp lệ.');
      }
      if (isNaN(baseFirstClassPrice)) {
        throw new Error('Giá vé hạng nhất phải là một số hợp lệ.');
      }

      // Tạo dữ liệu gửi lên backend
      const flightData = {
        airline_id: form.airline_id,
        route_id: form.route_id,
        aircraft_id: form.aircraft_id,
        flight_number: form.flight_number,
        departure_time: departureTimeISO,
        arrival_time: arrivalTimeISO,
        flight_status: form.flight_status,
        base_economy_class_price: baseEconomyPrice,
        base_business_class_price: baseBusinessPrice,
        base_first_class_price: baseFirstClassPrice
      };

      console.log('📊 Dữ liệu gửi lên backend:', flightData);

      const newFlight = await createFlight(flightData);
      setFlights([...flights, newFlight.data]);
      setForm({
        airline_id: '',
        route_id: '',
        flight_number: '',
        aircraft_id: '',
        departure_time: '',
        arrival_time: '',
        base_economy_class_price: '',
        base_business_class_price: '',
        base_first_class_price: '',
        flight_status: 'Scheduled',
      });
      alert('Thêm chuyến bay thành công!');
    } catch (err) {
      console.log('❌ Lỗi khi tạo chuyến bay:', err);
      setError('Không thể thêm chuyến bay: ' + err.message);
    }
  };

  const handleDelaySubmit = async (e) => {
    e.preventDefault();
    try {
      const newDepartureISO = new Date(delayForm.newDeparture).toISOString();
      const newArrivalISO = new Date(delayForm.newArrival).toISOString();

      if (new Date(newDepartureISO) >= new Date(newArrivalISO)) {
        throw new Error('Giờ khởi hành mới phải nhỏ hơn giờ đến mới.');
      }

      const updatedFlight = await delayFlight(delayForm.flightId, {
        newDeparture: newDepartureISO,
        newArrival: newArrivalISO
      });
      setFlights(flights.map(flight =>
        flight.id === delayForm.flightId ? updatedFlight.data : flight
      ));
      setDelayForm({ flightId: '', newDeparture: '', newArrival: '' });
      alert('Cập nhật giờ khởi hành thành công!');
    } catch (err) {
      console.log('❌ Lỗi khi cập nhật giờ khởi hành:', err);
      setError('Không thể cập nhật giờ khởi hành: ' + err.message);
    }
  };

  if (loading) return <div className="text-center p-4">Đang tải...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-4"
    >
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Quản lý chuyến bay</h1>
      {error && (
        <div className="text-center p-4 text-red-500">
          {error}
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Thêm chuyến bay mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Hãng Hàng Không</label>
            <select
              name="airline_id"
              value={form.airline_id}
              onChange={(e) => setForm({ ...form, airline_id: e.target.value })}
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
            <label className="block text-gray-700 mb-2">Tuyến Bay</label>
            <select
              name="route_id"
              value={form.route_id}
              onChange={(e) => setForm({ ...form, route_id: e.target.value })}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Chọn tuyến bay</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.departure_airport_name} ({route.departure_airport_code}) → {route.arrival_airport_name} ({route.arrival_airport_code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Số Hiệu Chuyến Bay</label>
            <input
              type="text"
              name="flight_number"
              value={form.flight_number}
              onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
              className="p-2 border rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Tàu Bay</label>
            <select
              name="aircraft_id"
              value={form.aircraft_id}
              onChange={(e) => setForm({ ...form, aircraft_id: e.target.value })}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Chọn tàu bay</option>
              {aircrafts.map(aircraft => (
                <option key={aircraft.id} value={aircraft.id}>
                  {aircraft.aircraft_code} ({aircraft.manufacturer})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Giờ Khởi Hành</label>
            <input
              type="datetime-local"
              name="departure_time"
              value={form.departure_time}
              onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
              className="p-2 border rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Giờ Đến</label>
            <input
              type="datetime-local"
              name="arrival_time"
              value={form.arrival_time}
              onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
              className="p-2 border rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Giá Vé Phổ Thông (VND)</label>
            <input
              type="number"
              name="base_economy_class_price"
              value={form.base_economy_class_price}
              onChange={(e) => setForm({ ...form, base_economy_class_price: e.target.value })}
              className="p-2 border rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Giá Vé Thương Gia (VND)</label>
            <input
              type="number"
              name="base_business_class_price"
              value={form.base_business_class_price}
              onChange={(e) => setForm({ ...form, base_business_class_price: e.target.value })}
              className="p-2 border rounded w-full"
              placeholder="Nhập giá vé thương gia (mặc định 0 nếu bỏ trống)"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Giá Vé Hạng Nhất (VND)</label>
            <input
              type="number"
              name="base_first_class_price"
              value={form.base_first_class_price}
              onChange={(e) => setForm({ ...form, base_first_class_price: e.target.value })}
              className="p-2 border rounded w-full"
              placeholder="Nhập giá vé hạng nhất (mặc định 0 nếu bỏ trống)"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Trạng Thái Chuyến Bay</label>
            <select
              name="flight_status"
              value={form.flight_status}
              onChange={(e) => setForm({ ...form, flight_status: e.target.value })}
              className="p-2 border rounded w-full"
              required
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Departed">Departed</option>
              <option value="Arrived">Arrived</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition w-full"
          >
            Thêm Chuyến Bay
          </motion.button>
        </form>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Cập nhật Giờ Khởi Hành</h2>
        <form onSubmit={handleDelaySubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Chọn Chuyến Bay</label>
            <select
              value={delayForm.flightId}
              onChange={(e) => setDelayForm({ ...delayForm, flightId: e.target.value })}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Chọn chuyến bay</option>
              {flights.map(flight => (
                <option key={flight.id} value={flight.id}>
                  {flight.flight_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Giờ Khởi Hành Mới</label>
            <input
              type="datetime-local"
              value={delayForm.newDeparture}
              onChange={(e) => setDelayForm({ ...delayForm, newDeparture: e.target.value })}
              className="p-2 border rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Giờ Đến Mới</label>
            <input
              type="datetime-local"
              value={delayForm.newArrival}
              onChange={(e) => setDelayForm({ ...delayForm, newArrival: e.target.value })}
              className="p-2 border rounded w-full"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition w-full"
          >
            Cập nhật Giờ Khởi Hành
          </motion.button>
        </form>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Danh sách Chuyến Bay</h2>
        <div className="space-y-4">
          {flights.length > 0 ? (
            flights.map(flight => (
              <div key={flight.id} className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-xl font-semibold">{flight.flight_number}</h3>
                <p>Tàu Bay: {flight.aircraft_id}</p>
                <p>Giờ Khởi Hành: {new Date(flight.departure_time).toLocaleString()}</p>
                <p>Giờ Đến: {new Date(flight.arrival_time).toLocaleString()}</p>
                <p>Giá Vé Phổ Thông: {flight.base_economy_class_price?.toLocaleString()} VND</p>
                <p>Giá Vé Thương Gia: {flight.base_business_class_price?.toLocaleString() || 0} VND</p>
                <p>Giá Vé Hạng Nhất: {flight.base_first_class_price?.toLocaleString() || 0} VND</p>
              </div>
            ))
          ) : (
            <p>Không có chuyến bay nào.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default AdminFlights;