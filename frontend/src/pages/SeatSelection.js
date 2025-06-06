import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, ticketType, customer, formData } = location.state || {};

  // Mock data ghế (sẽ thay bằng API từ backend)
  const [seatData, setSeatData] = useState({
    economy: [
      {
        cabin: 'E1',
        rows: Array(10).fill().map((_, i) => ({
          row: String.fromCharCode(65 + i), // A, B, C, ...
          seats: [
            { id: `${i + 1}`, available: true },
            { id: `${i + 2}`, available: false },
            { id: `${i + 3}`, available: true },
            { id: `${i + 4}`, available: true }
          ]
        }))
      },
      // Thêm khoang E2, E3,... khi có dữ liệu từ backend
    ],
    business: [
      {
        cabin: 'B1',
        rows: Array(5).fill().map((_, i) => ({
          row: String.fromCharCode(65 + i),
          seats: [
            { id: `${i + 1}`, available: true },
            { id: `${i + 2}`, available: false }
          ]
        }))
      }
    ],
    first: [
      {
        cabin: 'F1',
        rows: Array(5).fill().map((_, i) => ({
          row: String.fromCharCode(65 + i),
          seats: [{ id: `${i + 1}`, available: true }]
        }))
      }
    ]
  });

  const [selectedCabin, setSelectedCabin] = useState('E1'); // Khoang mặc định
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách khoang để hiển thị tabs
  const cabins = [
    ...seatData.economy.map(c => c.cabin),
    ...seatData.business.map(c => c.cabin),
    ...seatData.first.map(c => c.cabin)
  ];

  // Lấy khoang hiện tại
  const currentCabinData = [
    ...seatData.economy,
    ...seatData.business,
    ...seatData.first
  ].find(c => c.cabin === selectedCabin);

  // Chọn ghế
  const handleSeatSelect = (row, seatId) => {
    if (selectedSeat === `${selectedCabin}-${row}-${seatId}`) {
      setSelectedSeat(null); // Bỏ chọn
    } else {
      setSelectedSeat(`${selectedCabin}-${row}-${seatId}`); // Chọn ghế
    }
  };

  // Xác nhận ghế
  const handleConfirm = () => {
    if (!selectedSeat) {
      alert('Vui lòng chọn một ghế!');
      return;
    }
    setLoading(true);
    // Chuyển về Booking.js với ghế đã chọn
    navigate('/booking', {
      state: {
        flight,
        ticketType,
        customer,
        formData: { ...formData, seat_number: selectedSeat }
      }
    });
  };

  // Quay lại Booking.js
  const handleBack = () => {
    navigate('/booking', { state: { flight, ticketType, customer, formData } });
  };

  if (!flight || !ticketType) {
    return <div className="text-center p-4">Không tìm thấy thông tin chuyến bay</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-6 bg-green-50 min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-600 text-center">Chọn Ghế Ngồi</h1>

      {/* Thanh điều hướng khoang */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2 overflow-x-auto bg-white p-2 rounded-xl shadow-md border border-green-100">
          {cabins.map(cabin => (
            <motion.button
              key={cabin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCabin(cabin)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedCabin === cabin
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Khoang {cabin}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chú thích */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-green-100 mb-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-green-600 mb-3">Chú Thích</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-semibold text-green-700">Hạng vé: {classTypeNames[ticketType.classType]}</p>
            <p className="text-sm text-gray-600">
              {ticketType.classType === 'economy' ? '10 hàng, 4 ghế/hàng, 2 lối đi' :
               ticketType.classType === 'business' ? '5 hàng, 2 ghế/hàng, 2 lối đi' :
               '5 hàng, 1 ghế/hàng, 2 lối đi'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <p className="text-sm text-gray-600">Ghế còn trống</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <p className="text-sm text-gray-600">Ghế đã đặt</p>
          </div>
        </div>
      </div>

      {/* Sơ đồ ghế */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-green-600 mb-4 text-center">Sơ Đồ Ghế - Khoang {selectedCabin}</h2>
        <div className="flex justify-center">
          <div className="w-full">
            {currentCabinData.rows.map((row, rowIndex) => (
              <div key={row.row} className="flex items-center justify-center mb-4">
                {/* Lối đi bên trái (First class) */}
                {selectedCabin.startsWith('F') && <div className="w-16 bg-gray-100 h-12"></div>}
                {/* Cột ghế */}
                <div className={`flex ${selectedCabin.startsWith('F') ? 'justify-center' : 'justify-between'} w-full`}>
                  {/* Cột trái */}
                  <div className="flex space-x-2">
                    {row.seats.slice(0, selectedCabin.startsWith('F') ? 1 : 2).map(seat => (
                      <motion.div
                        key={`${row.row}-${seat.id}`}
                        whileHover={{ scale: seat.available ? 1.1 : 1 }}
                        onClick={() => seat.available && handleSeatSelect(row.row, seat.id)}
                        className={`w-12 h-12 rounded flex items-center justify-center text-sm font-semibold cursor-pointer transition ${
                          selectedSeat === `${selectedCabin}-${row.row}-${seat.id}`
                            ? 'bg-green-700 text-white'
                            : seat.available
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white cursor-not-allowed'
                        }`}
                      >
                        {row.row}{seat.id}
                      </motion.div>
                    ))}
                  </div>
                  {/* Lối đi giữa */}
                  {!selectedCabin.startsWith('F') && <div className="w-16 bg-gray-100 h-12"></div>}
                  {/* Cột phải */}
                  {!selectedCabin.startsWith('F') && (
                    <div className="flex space-x-2">
                      {row.seats.slice(2).map(seat => (
                        <motion.div
                          key={`${row.row}-${seat.id}`}
                          whileHover={{ scale: seat.available ? 1.1 : 1 }}
                          onClick={() => seat.available && handleSeatSelect(row.row, seat.id)}
                          className={`w-12 h-12 rounded flex items-center justify-center text-sm font-semibold cursor-pointer transition ${
                            selectedSeat === `${selectedCabin}-${row.row}-${seat.id}`
                              ? 'bg-green-700 text-white'
                              : seat.available
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white cursor-not-allowed'
                          }`}
                        >
                          {row.row}{seat.id}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Lối đi bên phải (First class) */}
                {selectedCabin.startsWith('F') && <div className="w-16 bg-gray-100 h-12"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nút điều hướng */}
      <div className="flex justify-center space-x-4 mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition font-semibold"
        >
          Quay lại
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận ghế'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SeatSelection;