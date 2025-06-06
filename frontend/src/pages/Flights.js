import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getFlights, searchFlights } from '../services/api';
import { staticFlights } from '../data/flights';
import { useNavigate } from 'react-router-dom';

function Flights() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState({ from_airport_id: '', to_airport_id: '', date: '' });
  const [ticketTypes, setTicketTypes] = useState({});

  // Define classTypeNames for ticket class display
  const classTypeNames = {
    economy: 'Phổ thông',
    business: 'Thương gia',
    first: 'Hạng nhất'
  };

  useEffect(() => {
    setLoading(true);

    const fetchFlights = async () => {
      try {
        const flightsRes = await getFlights();
        console.log('Flight data:', flightsRes.data);
        const flightsData = Array.isArray(flightsRes.data.data) ? flightsRes.data.data : [];
        setFlights(flightsData);

        const airportSet = new Set();
        flightsData.forEach(flight => {
          airportSet.add(JSON.stringify({
            id: flight.departure_airport_id,
            name: flight.departure_airport_name,
            code: flight.departure_airport_code
          }));
          airportSet.add(JSON.stringify({
            id: flight.arrival_airport_id,
            name: flight.arrival_airport_name,
            code: flight.arrival_airport_code
          }));
        });
        const uniqueAirports = Array.from(airportSet).map(airport => JSON.parse(airport));
        setAirports(uniqueAirports);
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError('Không thể tải danh sách chuyến bay: ' + err.message);
        setFlights(staticFlights);

        const airportSet = new Set();
        staticFlights.forEach(flight => {
          airportSet.add(JSON.stringify({
            id: flight.departure_airport_id,
            name: flight.departure_airport_name,
            code: flight.departure_airport_code
          }));
          airportSet.add(JSON.stringify({
            id: flight.arrival_airport_id,
            name: flight.arrival_airport_name,
            code: flight.arrival_airport_code
          }));
        });
        const uniqueAirports = Array.from(airportSet).map(airport => JSON.parse(airport));
        setAirports(uniqueAirports);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.from_airport_id || !search.to_airport_id || !search.date) {
      setError('Vui lòng chọn đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const searchData = {
        legs: [
          {
            from_airport_id: search.from_airport_id,
            to_airport_id: search.to_airport_id,
            date: search.date
          }
        ]
      };
      console.log('Search data:', searchData);
      const res = await searchFlights(searchData);
      console.log('Search response:', res.data);
      const flightsData = Array.isArray(res.data) ? res.data : [];
      const sortedFlights = flightsData.sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));
      setFlights(sortedFlights);
      if (sortedFlights.length === 0) {
        setError('Không tìm thấy chuyến bay nào phù hợp.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Không thể tìm kiếm: ' + err.message);
      setFlights(staticFlights);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketTypeChange = (flightId, type, value) => {
    setTicketTypes(prev => ({
      ...prev,
      [flightId]: {
        ...prev[flightId],
        [type]: value
      }
    }));
  };

  const calculatePrice = (flightId, basePrice) => {
    const ticketType = ticketTypes[flightId] || { tripType: 'one-way', classType: 'economy' };
    let price = basePrice;

    if (ticketType.tripType === 'round-trip') {
      price *= 2;
    }

    if (ticketType.classType === 'business') {
      price *= 1.5;
    } else if (ticketType.classType === 'first') {
      price *= 2;
    }

    return price;
  };

  const handleBookFlight = (flightId) => {
    const selectedFlight = flights.find(flight => flight.id === flightId);
    if (selectedFlight) {
      navigate(`/booking/${flightId}`, {
        state: {
          flight: selectedFlight,
          ticketType: ticketTypes[flightId] || { tripType: 'one-way', classType: 'economy' }
        }
      });
    } else {
      setError('Không tìm thấy chuyến bay.');
    }
  };

  if (loading) return <div className="text-center p-4">Đang tải...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-700">Tìm chuyến bay</h1>
      {error && (
        <div className="text-center p-4 text-red-500 bg-red-100 rounded-lg mb-6">
          {error}
          <p className="text-gray-600 mt-2">Hiển thị dữ liệu tĩnh do lỗi từ backend.</p>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <select
          value={search.from_airport_id}
          onChange={(e) => setSearch({ ...search, from_airport_id: e.target.value })}
          className="p-3 border rounded-lg flex-1 bg-gray-50 focus:ring-2 focus:ring-green-500"
          required
        >
          <option value="">Chọn địa điểm đi</option>
          {airports.map(airport => (
            <option key={airport.id} value={airport.id}>
              {airport.name} ({airport.code})
            </option>
          ))}
        </select>
        <select
          value={search.to_airport_id}
          onChange={(e) => setSearch({ ...search, to_airport_id: e.target.value })}
          className="p-3 border rounded-lg flex-1 bg-gray-50 focus:ring-2 focus:ring-green-500"
          required
        >
          <option value="">Chọn địa điểm đến</option>
          {airports.map(airport => (
            <option key={airport.id} value={airport.id}>
              {airport.name} ({airport.code})
            </option>
          ))}
        </select>
        <input
          type="date"
          value={search.date}
          onChange={(e) => setSearch({ ...search, date: e.target.value })}
          className="p-3 border rounded-lg flex-1 bg-gray-50 focus:ring-2 focus:ring-green-500"
          required
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition shadow-md"
        >
          Tìm kiếm
        </motion.button>
      </form>

      {/* Flights Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-green-100 text-green-800">
              <th className="px-6 py-4 text-left font-semibold">Số Hiệu Chuyến Bay</th>
              <th className="px-6 py-4 text-left font-semibold">Hãng Hàng Không</th>
              <th className="px-6 py-4 text-left font-semibold">Tàu Bay</th>
              <th className="px-6 py-4 text-left font-semibold">Địa Điểm Đi</th>
              <th className="px-6 py-4 text-left font-semibold">Địa Điểm Đến</th>
              <th className="px-6 py-4 text-left font-semibold">Ngày Khởi Hành</th>
              <th className="px-6 py-4 text-left font-semibold">Giờ Khởi Hành</th>
              <th className="px-6 py-4 text-left font-semibold">Ngày Đến</th>
              <th className="px-6 py-4 text-left font-semibold">Giờ Đến</th>
              <th className="px-6 py-4 text-left font-semibold">Loại Giá Vé</th>
              <th className="px-6 py-4 text-left font-semibold">Giá Tiền (VND)</th>
              <th className="px-6 py-4 text-left font-semibold">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {flights.length > 0 ? (
              flights.map((flight, index) => {
                const availableClasses = ['economy', 'business', 'first'].filter(cls => 
                  flight.available_seats && flight.available_seats[cls] > 0
                );
                if (availableClasses.length === 0) return null; // Ẩn chuyến bay nếu hết ghế

                return (
                  <tr
                    key={flight.id}
                    className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-green-50 transition-colors duration-200`}
                  >
                    <td className="px-6 py-4">{flight.flight_number}</td>
                    <td className="px-6 py-4">{flight.airline_name || 'N/A'}</td>
                    <td className="px-6 py-4">{flight.aircraft_type || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {flight.departure_airport_name} ({flight.departure_airport_code})
                    </td>
                    <td className="px-6 py-4">
                      {flight.arrival_airport_name} ({flight.arrival_airport_code})
                    </td>
                    <td className="px-6 py-4">{new Date(flight.departure_time).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4">{new Date(flight.arrival_time).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4">
                      <select
                        value={ticketTypes[flight.id]?.tripType || 'one-way'}
                        onChange={(e) => handleTicketTypeChange(flight.id, 'tripType', e.target.value)}
                        className="p-2 border rounded mr-2 bg-gray-100 focus:ring-2 focus:ring-green-500"
                      >
                        <option value="one-way">Một chiều</option>
                        <option value="round-trip">Khứ hồi</option>
                      </select>
                      <select
                        value={ticketTypes[flight.id]?.classType || availableClasses[0]}
                        onChange={(e) => handleTicketTypeChange(flight.id, 'classType', e.target.value)}
                        className="p-2 border rounded bg-gray-100 focus:ring-2 focus:ring-green-500"
                      >
                        {availableClasses.map(cls => (
                          <option key={cls} value={cls}>
                            {classTypeNames[cls]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {calculatePrice(flight.id, flight.base_economy_class_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBookFlight(flight.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition shadow-md"
                      >
                        Đặt vé
                      </motion.button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" className="px-6 py-4 text-center">Không tìm thấy chuyến bay nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default Flights;