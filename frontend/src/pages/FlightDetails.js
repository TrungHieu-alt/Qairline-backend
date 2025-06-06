import { useParams } from 'react-router-dom';
import { getFlight } from '../services/api';
import { staticFlights } from '../data/flights';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function FlightDetails() {
    const { flightId } = useParams();
    const [flight, setFlight] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        getFlight(flightId)
            .then(res => {
                setFlight(res.data);
            })
            .catch(err => {
                setError('Không thể tải thông tin chuyến bay: ' + err.message);
                // Sử dụng dữ liệu tĩnh làm dự phòng
                const staticFlight = staticFlights.find(f => f.id === parseInt(flightId));
                setFlight(staticFlight);
            })
            .finally(() => setLoading(false));
    }, [flightId]);

    if (loading) return <div className="text-center p-4">Đang tải...</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                    <p className="text-gray-600 mt-2">Hiển thị dữ liệu tĩnh do lỗi từ backend.</p>
                </div>
            )}
            {!flight ? (
                <div className="text-center p-4 text-red-500">Không tìm thấy chuyến bay</div>
            ) : (
                <>
                    <h1 className="text-3xl font-bold mb-6 text-green-600">Chi tiết chuyến bay {flight.flight_number}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cột trái: Thông tin chuyến bay */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h2 className="text-2xl font-semibold mb-4">Thông tin chuyến bay</h2>
                            <p><strong>Số hiệu:</strong> {flight.flight_number}</p>
                            <p><strong>Khởi hành:</strong> {flight.departure} - {new Date(flight.departureTime).toLocaleString()}</p>
                            <p><strong>Đến:</strong> {flight.destination} - {new Date(flight.arrivalTime).toLocaleString()}</p>
                            <p><strong>Thời gian bay:</strong> {flight.duration}</p>
                            <p><strong>Máy bay:</strong> {flight.aircraft}</p>
                            <p><strong>Phi công:</strong> {flight.pilot?.name || "N/A"} (Kinh nghiệm: {flight.pilot?.experience || "N/A"})</p>
                            <p><strong>Lưu ý:</strong> {flight.notes || "Không có lưu ý"}</p>
                            <h3 className="text-xl font-semibold mt-4 mb-2">Thông tin điểm đến</h3>
                            <p>{flight.destinationInfo || "Không có thông tin điểm đến"}</p>
                        </motion.div>
                        {/* Cột phải: Hình ảnh điểm đi/điểm đến */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h2 className="text-2xl font-semibold mb-4">Hình ảnh</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">Điểm đi: {flight.departure}</h3>
                                    <img src={flight.departureImage || "https://images.unsplash.com/photo-1583394838336-acd977736f90"} alt={flight.departure} className="w-full h-48 object-cover rounded-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Điểm đến: {flight.destination}</h3>
                                    <img src={flight.destinationImage || "https://images.unsplash.com/photo-1590004987778-bece5c9adab6"} alt={flight.destination} className="w-full h-48 object-cover rounded-lg" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </motion.div>
    );
}

export default FlightDetails;