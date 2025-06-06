import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCustomer } from '../services/api';
import AuthForm from '../components/AuthForm';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      const res = await registerCustomer(data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      localStorage.setItem('email', res.data.user.email);
      localStorage.setItem('username', res.data.user.username || '');
      localStorage.setItem('first_name', res.data.user.first_name);
      localStorage.setItem('last_name', res.data.user.last_name || '');
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.error || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      } else {
        setError('Đăng ký thất bại: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAdmin={false} />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto p-4 pt-28 flex-grow"
      >
        <h1 className="text-2xl font-bold mb-4 text-green-600">Đăng ký</h1>
        {error && (
          <div className="text-center p-4 text-red-500">
            {error}
            <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
          </div>
        )}
        <AuthForm type="register" onSubmit={onSubmit} />
      </motion.div>
      <Footer />
    </div>
  );
}

export default Register;