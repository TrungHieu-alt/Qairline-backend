import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFlights, deleteFlight, getTicketStats } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [flights, setFlights] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        setLoading(true);
        Promise.all([
            getFlights(),
            getTicketStats()
        ])
            .then(([flightsRes, statsRes]) => {
                setFlights(flightsRes.data);
                setStats(statsRes.data);
            })
            .catch(err => setError('Không thể tải dữ liệu: ' + err.message))
            .finally(() => setLoading(false));
    }, [user, navigate]);

    const handleDelete = async (flightId) => {
        if (window.confirm('Bạn có chắc muốn xóa chuyến bay này?')) {
            try {
                await deleteFlight(flightId);
                setFlights(flights.filter(flight => flight.id !== flightId));
                alert('Xóa chuyến bay thành công!');
            } catch (err) {
                alert('Lỗi khi xóa chuyến bay: ' + err.message);
            }
        }
    };

    if (loading) return <div className="text-center p-4">Đang tải...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-green-600">Quản trị chuyến bay</h1>
            {stats && (
                <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Thống kê</h2>
                    <p>Tổng số vé đã đặt: {stats.totalTickets}</p>
                    <p>Tổng doanh thu: {stats.totalRevenue} VND</p>
                </div>
            )}
            <div className="space-y-4">
                {flights.map(flight => (
                    <div key={flight.id} className="p-4 bg-white shadow-md rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{flight.flight_number}: {flight.departure} → {flight.destination}</p>
                            <p>{new Date(flight.time).toLocaleString()}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(flight.id)}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                        >
                            Xóa
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Admin;