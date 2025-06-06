import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function FlightCard({ flight, navigate }) {
    if (!flight) {
        return <div className="p-4 bg-white shadow-md rounded-lg">Không có dữ liệu chuyến bay</div>;
    }

    return (
        <div className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition">
            <p className="font-bold text-lg text-green-600">{flight.flight_number}</p>
            <p>{flight.departure} → {flight.destination}</p>
            <p>Khởi hành: {new Date(flight.departureTime).toLocaleString()}</p>
            <p>Giá: {flight.price ? flight.price.toLocaleString() : 'N/A'} VND</p>
            <div className="flex space-x-2 mt-2">
                <Link to={`/booking/${flight.id}`}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                    >
                        Đặt vé
                    </motion.button>
                </Link>
                <Link to={`/flight/${flight.id}`}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition"
                    >
                        Xem chi tiết
                    </motion.button>
                </Link>
            </div>
        </div>
    );
}

export default FlightCard;