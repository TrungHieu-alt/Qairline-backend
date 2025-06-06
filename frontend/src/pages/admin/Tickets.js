import { useState, useEffect } from 'react';
import { getTickets, getTicketStats } from '../../services/api';
import { motion } from 'framer-motion';

function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ totalTickets: 0, bookedTickets: 0, canceledTickets: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([getTickets(), getTicketStats()])
            .then(([ticketsRes, statsRes]) => {
                setTickets(ticketsRes.data || []);
                setStats(statsRes.data || { totalTickets: 0, bookedTickets: 0, canceledTickets: 0 });
            })
            .catch(err => setError('Không thể tải dữ liệu: ' + err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-4">Đang tải...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Quản lý đặt vé</h1>
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                </div>
            )}
            {/* Thống kê đặt vé */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Thống kê đặt vé</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-lg font-semibold">Tổng số vé</h3>
                        <p className="text-2xl">{stats.totalTickets}</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-lg font-semibold">Vé đã đặt</h3>
                        <p className="text-2xl">{stats.bookedTickets}</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-lg font-semibold">Vé đã hủy</h3>
                        <p className="text-2xl">{stats.canceledTickets}</p>
                    </div>
                </div>
            </div>
            {/* Danh sách vé */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Danh sách vé</h2>
                <div className="space-y-4">
                    {tickets.length > 0 ? (
                        tickets.map(ticket => (
                            <div key={ticket._id} className="bg-white shadow-md rounded-lg p-4">
                                <p className="font-semibold">Vé #{ticket._id}</p>
                                <p>Khách hàng: {ticket.customerId?.username}</p>
                                <p>Chuyến bay: {ticket.flightId?.flight_number} ({ticket.flightId?.departure} -> {ticket.flightId?.destination})</p>
                                <p>Trạng thái: {ticket.status === 'booked' ? 'Đã đặt' : 'Đã hủy'}</p>
                                <p>Ghế: {ticket.seat}</p>
                            </div>
                        ))
                    ) : (
                        <p>Không có vé nào.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default AdminTickets;