import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminStats, getRecentBookings, getUpcomingFlights, getBookingTrends } from '../../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useAuth } from '../../context/AuthContext';

// Đăng ký các thành phần của Chart.js, bao gồm Filler
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalFlights: 0, totalTickets: 0, totalRevenue: 0, totalAnnouncements: 0, totalUsers: 0 });
    const [recentBookings, setRecentBookings] = useState([]);
    const [upcomingFlights, setUpcomingFlights] = useState([]);
    const [bookingTrends, setBookingTrends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getAdminStats(),
            getRecentBookings(),
            getUpcomingFlights(),
            getBookingTrends()
        ])
            .then(([statsRes, bookingsRes, flightsRes, trendsRes]) => {
                setStats(statsRes.data);
                setRecentBookings(bookingsRes.data);
                setUpcomingFlights(flightsRes.data);
                setBookingTrends(trendsRes.data);
            })
            .catch(err => setError('Không thể tải dữ liệu: ' + err.message))
            .finally(() => setLoading(false));
    }, []);

    // Dữ liệu cho biểu đồ xu hướng đặt vé
    const chartData = {
        labels: bookingTrends.map(trend => trend._id),
        datasets: [
            {
                label: 'Số lượng vé đặt',
                data: bookingTrends.map(trend => trend.count),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Xu hướng đặt vé (30 ngày gần đây)'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Ngày'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Số lượng vé'
                },
                beginAtZero: true
            }
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
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Bảng điều khiển quản trị</h1>
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                </div>
            )}
            {/* Thông tin chào mừng */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-md rounded-lg p-4 mb-6"
            >
                <h2 className="text-2xl font-semibold text-blue-600">Chào mừng, {user?.id}!</h2>
                <p className="text-gray-600">Đây là bảng điều khiển quản trị của QAirline. Dưới đây là các thông tin tổng quan về hệ thống.</p>
            </motion.div>
            {/* Thống kê chính */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"
            >
                <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-blue-600">Tổng số chuyến bay</h3>
                    <p className="text-2xl">{stats.totalFlights}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-green-600">Tổng số vé đặt</h3>
                    <p className="text-2xl">{stats.totalTickets}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-yellow-600">Tổng doanh thu</h3>
                    <p className="text-2xl">{stats.totalRevenue.toLocaleString()} VND</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-purple-600">Tổng số thông báo</h3>
                    <p className="text-2xl">{stats.totalAnnouncements}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-red-600">Tổng số người dùng</h3>
                    <p className="text-2xl">{stats.totalUsers}</p>
                </div>
            </motion.div>
            {/* Biểu đồ xu hướng đặt vé */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white shadow-md rounded-lg p-4 mb-6"
            >
                <Line data={chartData} options={chartOptions} />
            </motion.div>
            {/* Danh sách vé đặt gần đây */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white shadow-md rounded-lg p-4 mb-6"
            >
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">Vé đặt gần đây</h2>
                {recentBookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b">Mã vé</th>
                                    <th className="px-4 py-2 border-b">Khách hàng</th>
                                    <th className="px-4 py-2 border-b">Chuyến bay</th>
                                    <th className="px-4 py-2 border-b">Điểm đi</th>
                                    <th className="px-4 py-2 border-b">Điểm đến</th>
                                    <th className="px-4 py-2 border-b">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map(booking => (
                                    <tr key={booking._id}>
                                        <td className="px-4 py-2 border-b">{booking._id}</td>
                                        <td className="px-4 py-2 border-b">{booking.customerId?.username || 'N/A'}</td>
                                        <td className="px-4 py-2 border-b">{booking.flightId?.flight_number || 'N/A'}</td>
                                        <td className="px-4 py-2 border-b">{booking.flightId?.departure || 'N/A'}</td>
                                        <td className="px-4 py-2 border-b">{booking.flightId?.destination || 'N/A'}</td>
                                        <td className="px-4 py-2 border-b">{booking.status === 'booked' ? 'Đã đặt' : 'Đã hủy'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>Không có vé nào được đặt gần đây.</p>
                )}
            </motion.div>
            {/* Danh sách chuyến bay sắp tới */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-white shadow-md rounded-lg p-4"
            >
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">Chuyến bay sắp tới</h2>
                {upcomingFlights.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b">Số hiệu</th>
                                    <th className="px-4 py-2 border-b">Tàu bay</th>
                                    <th className="px-4 py-2 border-b">Điểm đi</th>
                                    <th className="px-4 py-2 border-b">Điểm đến</th>
                                    <th className="px-4 py-2 border-b">Giờ khởi hành</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingFlights.map(flight => (
                                    <tr key={flight._id}>
                                        <td className="px-4 py-2 border-b">{flight.flight_number}</td>
                                        <td className="px-4 py-2 border-b">{flight.aircraft?.code || 'N/A'}</td>
                                        <td className="px-4 py-2 border-b">{flight.departure}</td>
                                        <td className="px-4 py-2 border-b">{flight.destination}</td>
                                        <td className="px-4 py-2 border-b">{new Date(flight.departureTime).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>Không có chuyến bay sắp tới.</p>
                )}
            </motion.div>
        </motion.div>
    );
}

export default AdminDashboard;