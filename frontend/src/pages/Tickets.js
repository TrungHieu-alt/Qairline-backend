import { useState, useEffect } from 'react';
import { getTickets, trackTicket } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function Tickets() {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [tickets, setTickets] = useState([]);
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelPassword, setCancelPassword] = useState('');
  const [cancelError, setCancelError] = useState(null);

  // Load danh sách vé nếu người dùng đăng nhập
  useEffect(() => {
    if (user) {
      setLoading(true);
      getTickets()
        .then(res => {
          console.log('Tickets response:', res.data); // Debug
          setTickets(res.data.data || []);
          if (!res.data.data.length) {
            setError('Bạn chưa có vé.');
          }
        })
        .catch(err => {
          console.error('Error fetching tickets:', err);
          const errorMessage = err.response?.status === 401 
            ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
            : err.response?.status === 403
              ? 'Bạn không có quyền truy cập.'
              : err.message.includes('Network Error')
                ? 'Lỗi kết nối server. Vui lòng kiểm tra mạng hoặc thử lại sau.'
                : 'Không thể tải danh sách vé: ' + (err.response?.data?.error || err.message);
          setError(errorMessage);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Tra cứu vé bằng mã code
  const onTrackTicket = async (data) => {
    setLoading(true);
    setCancelError(null);
    try {
      const res = await trackTicket(data.code);
      console.log('Tracked ticket:', res.data); // Debug
      setTrackedTicket(res.data.ticket || null);
      setError(null);
    } catch (err) {
      console.error('Error tracking ticket:', err);
      const errorMessage = err.response?.status === 404 
        ? 'Không tìm thấy vé với mã code này.' 
        : 'Lỗi khi tra cứu vé: ' + (err.response?.data?.error || err.message);
      setError(errorMessage);
      setTrackedTicket(null);
    } finally {
      setLoading(false);
    }
  };

  // Hủy vé cho người dùng không đăng nhập
  const handleCancelTicketWithoutLogin = async () => {
    if (!cancelPassword) {
      setCancelError('Vui lòng nhập mật khẩu.');
      return;
    }
    setLoading(true);
    setCancelError(null);
    try {
      console.log('Cancel request:', { ticketId: trackedTicket.id, password: cancelPassword }); // Debug
      const response = await axios.post(
        `${API_URL}/api/tickets/${trackedTicket.id}/cancel`,
        { password: cancelPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Cancel response:', response.data); // Debug
      alert('Hủy vé thành công!');
      setTrackedTicket({ ...trackedTicket, ticket_status: 'Cancelled' });
      setShowCancelForm(false);
      setCancelPassword('');
    } catch (err) {
      console.error('Cancel error:', err);
      const errorMessage = err.response?.data?.message === 'Tài khoản này không có mật khẩu. Vui lòng đăng nhập để hủy vé.'
        ? err.response.data.message
        : err.response?.data?.message === 'Mật khẩu không đúng'
          ? 'Mật khẩu không đúng. Vui lòng nhập lại mật khẩu đã sử dụng khi đặt vé.'
          : 'Hủy vé thất bại: ' + (err.response?.data?.message || err.message);
      setCancelError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Hủy vé cho người dùng đã đăng nhập
  const handleCancelTicketWithLogin = async (ticketId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/tickets/${ticketId}/cancel`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': localStorage.getItem('userId')
          }
        }
      );
      console.log('Cancel response:', response.data); // Debug
      alert('Hủy vé thành công!');
      setTickets(tickets.map(item =>
        item.ticket.id === ticketId
          ? { ...item, ticket: { ...item.ticket, ticket_status: 'Cancelled' } }
          : item
      ));
    } catch (err) {
      console.error('Cancel error:', err);
      setError('Hủy vé thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Đang tải...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-6 bg-green-50 min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-600 text-center">Vé Của Tôi</h1>
      {error && (
        <div className="text-center p-4 text-red-600 bg-red-100 rounded-lg mb-6 shadow-md">
          {error}
          <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
        </div>
      )}

      {/* Tra cứu vé công khai */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-green-100 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-green-600 border-b border-green-200 pb-2">Tra Cứu Vé</h2>
        <form onSubmit={handleSubmit(onTrackTicket)} className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Nhập mã vé"
              {...register('code', { required: 'Mã vé là bắt buộc' })}
              className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold"
            disabled={loading}
          >
            Tra cứu
          </motion.button>
        </form>
        {trackedTicket && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mt-6 relative"
  >
    {/* Viền cắt đầu vé */}
    <div className="absolute top-0 left-0 right-0 h-4 border-b-2 border-dashed border-green-200"></div>
    {/* Logo giả */}
    <div className="flex justify-between items-center mb-4 pt-6">
      <img src="/path/to/logo.png" alt="AirGrok" className="h-8" />
      <div className="text-sm text-gray-600">Mã vé: {trackedTicket.ticket_code}</div>
    </div>
    {/* Thông tin vé */}
    <div className="grid grid-cols-10 gap-4">
      <div className="col-span-7 bg-green-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Chuyến Bay</h3>
        <p className="text-sm text-gray-600 font-light">Số hiệu chuyến bay: <span className="font-semibold text-green-800">{trackedTicket.flight_number || 'N/A'}</span></p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center">
            <p className="text-sm text-gray-600 font-light">Điểm đi: <span className="font-semibold text-green-800">{trackedTicket.departure_airport_name || 'N/A'}</span></p>
            <span className="mx-2 text-green-600">⇒</span>
            <p className="text-sm text-gray-600 font-light">{trackedTicket.departure_time ? new Date(trackedTicket.departure_time).toLocaleString() : 'N/A'}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-gray-600 font-light">Điểm đến: <span className="font-semibold text-green-800">{trackedTicket.arrival_airport_name || 'N/A'}</span></p>
            <span className="mx-2 text-green-600">⇒</span>
            <p className="text-sm text-gray-600 font-light">{trackedTicket.arrival_time ? new Date(trackedTicket.arrival_time).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </div>
      <div className="col-span-3 bg-green-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Chi Tiết Vé</h3>
        <p className="text-sm text-gray-600 font-light">
          Trạng thái:{' '}
          <span className={`font-semibold ${trackedTicket.ticket_status === 'Cancelled' ? 'text-red-500' : 'text-green-800'}`}>
            {trackedTicket.ticket_status === 'PendingPayment' ? 'Chờ thanh toán' : 
             trackedTicket.ticket_status === 'Confirmed' ? 'Đã xác nhận' : 'Đã hủy'}
          </span>
        </p>
        <p className="text-sm text-gray-600 font-light mt-1">Số ghế: <span className="font-semibold text-green-800">{trackedTicket.seat_number || 'N/A'}</span></p>
        <p className="text-sm text-gray-600 font-light mt-1">Giá vé: <span className="font-semibold text-green-600">{trackedTicket.price ? trackedTicket.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A'}</span></p>
        <p className="text-sm text-gray-600 font-light mt-1">Hạn hủy vé: <span className="font-semibold text-green-800">{trackedTicket.cancellation_deadline ? new Date(trackedTicket.cancellation_deadline).toLocaleString() : 'N/A'}</span></p>
      </div>
    </div>
    {/* Box thông tin người đặt vé */}
    <div className="mt-4 bg-green-50 p-4 rounded-lg">
      <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Người Đặt Vé</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 font-light">Họ tên: <span className="font-semibold text-green-800">{trackedTicket.customer?.first_name} {trackedTicket.customer?.last_name}</span></p>
          <p className="text-sm text-gray-600 font-light mt-2">Email: <span className="font-semibold text-green-800">{trackedTicket.customer?.email || 'N/A'}</span></p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-light">Số điện thoại: <span className="font-semibold text-green-800">{trackedTicket.customer?.phone_number || 'N/A'}</span></p>
          <p className="text-sm text-gray-600 font-light mt-2">Số CMND/CCCD: <span className="font-semibold text-green-800">{trackedTicket.customer?.identity_number || 'N/A'}</span></p>
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
    {/* Nút hủy vé */}
    {trackedTicket.ticket_status !== 'Cancelled' && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCancelForm(true)}
        className="bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition font-semibold mt-6"
        disabled={loading}
      >
        Hủy vé
      </motion.button>
    )}
    {showCancelForm && trackedTicket.ticket_status !== 'Cancelled' && (
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-green-700">Xác Nhận Hủy Vé</h3>
        <input
          type="password"
          placeholder="Nhập mật khẩu khi đặt vé"
          value={cancelPassword}
          onChange={(e) => setCancelPassword(e.target.value)}
          className="p-3 border border-green-200 rounded-lg w-full mb-2 focus:ring-2 focus:ring-green-500 transition"
        />
        {cancelError && <p className="text-red-500 text-sm mb-2">{cancelError}</p>}
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancelTicketWithoutLogin}
            className="bg-green-500 text-white p-3 rounded-lg flex-1 hover:bg-green-600 transition font-semibold"
            disabled={loading}
          >
            Xác nhận hủy
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowCancelForm(false);
              setCancelPassword('');
              setCancelError(null);
            }}
            className="bg-gray-500 text-white p-3 rounded-lg flex-1 hover:bg-gray-600 transition font-semibold"
            disabled={loading}
          >
            Hủy bỏ
          </motion.button>
        </div>
      </div>
    )}
  </motion.div>
)}
</div>

      {user && (
  <div className="max-w-3xl mx-auto">
    <h2 className="text-2xl font-semibold mb-6 text-green-600 text-center">Danh Sách Vé Đã Đặt</h2>
    {tickets.length > 0 ? (
      tickets.map((item, index) => (
        <motion.div
          key={item.ticket.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="mb-8 bg-white p-6 rounded-xl shadow-md border border-green-100 relative"
        >
          {/* Viền cắt đầu vé */}
          <div className="absolute top-0 left-0 right-0 h-4 border-b-2 border-dashed border-green-200"></div>
          {/* Logo giả */}
          <div className="flex justify-between items-center mb-4 pt-6">
            <img src="/path/to/logo.png" alt="AirGrok" className="h-8" />
            <div className="text-sm text-gray-600">Mã vé: {item.ticket.ticket_code}</div>
          </div>
          {/* Thông tin vé */}
          <div className="grid grid-cols-10 gap-4">
            <div className="col-span-7 bg-green-50 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Chuyến Bay</h3>
              <p className="text-sm text-gray-600 font-light">Số hiệu chuyến bay: <span className="font-semibold text-green-800">{item.ticket.flight_number || 'N/A'}</span></p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center">
                  <p className="text-sm text-gray-600 font-light">Điểm đi: <span className="font-semibold text-green-800">{item.flight_info.departure_airport || 'N/A'}</span></p>
                  <span className="mx-2 text-green-600">⇒</span>
                  <p className="text-sm text-gray-600 font-light">{item.flight_info.departure_time ? new Date(item.flight_info.departure_time).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-gray-600 font-light">Điểm đến: <span className="font-semibold text-green-800">{item.flight_info.arrival_airport || 'N/A'}</span></p>
                  <span className="mx-2 text-green-600">⇒</span>
                  <p className="text-sm text-gray-600 font-light">{item.flight_info.arrival_time ? new Date(item.flight_info.arrival_time).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="col-span-3 bg-green-50 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Chi Tiết Vé</h3>
              <p className="text-sm text-gray-600 font-light">
                Trạng thái:{' '}
                <span className={`font-semibold ${item.ticket.ticket_status === 'Cancelled' ? 'text-red-500' : 'text-green-800'}`}>
                  {item.ticket.ticket_status === 'PendingPayment' ? 'Chờ thanh toán' : 
                   item.ticket.ticket_status === 'Confirmed' ? 'Đã xác nhận' : 'Đã hủy'}
                </span>
              </p>
              <p className="text-sm text-gray-600 font-light mt-1">Số ghế: <span className="font-semibold text-green-800">{item.ticket.seat_number || 'N/A'}</span></p>
              <p className="text-sm text-gray-600 font-light mt-1">Giá vé: <span className="font-semibold text-green-600">{item.ticket.price ? item.ticket.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A'}</span></p>
              <p className="text-sm text-gray-600 font-light mt-1">Hạn hủy vé: <span className="font-semibold text-green-800">{item.ticket.cancellation_deadline ? new Date(item.ticket.cancellation_deadline).toLocaleString() : 'N/A'}</span></p>
            </div>
          </div>
          {/* Box thông tin người đặt vé */}
          <div className="mt-4 bg-green-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Người Đặt Vé</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-light">Họ tên: <span className="font-semibold text-green-800">{item.customer?.first_name} {item.customer?.last_name}</span></p>
                <p className="text-sm text-gray-600 font-light mt-2">Email: <span className="font-semibold text-green-800">{item.customer?.email || 'N/A'}</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-light">Số điện thoại: <span className="font-semibold text-green-800">{item.customer?.phone_number || 'N/A'}</span></p>
                <p className="text-sm text-gray-600 font-light mt-2">Số CMND/CCCD: <span className="font-semibold text-green-800">{item.customer?.identity_number || 'N/A'}</span></p>
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
          {/* Nút hủy vé */}
          {item.ticket.ticket_status !== 'Cancelled' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCancelTicketWithLogin(item.ticket.id)}
              className="bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition font-semibold mt-6"
              disabled={loading}
            >
              Hủy vé
            </motion.button>
          )}
        </motion.div>
      ))
          ) : (
            <div className="text-center p-4 text-gray-600 bg-white rounded-xl shadow-md border border-green-100">
              Bạn chưa có vé nào.
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default Tickets;