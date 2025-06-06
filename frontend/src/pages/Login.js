import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCustomer, loginEmployee } from '../services/api';
import AuthForm from '../components/AuthForm';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [role, setRole] = useState('customer');

  const onSubmit = async (data) => {
    try {
      let res;
      if (role === 'customer') {
        res = await loginCustomer(data);
        const userData = res.data.data;
        if (!userData || !userData.user || !userData.user.id) {
          throw new Error('Dữ liệu người dùng không hợp lệ');
        }
        login(userData);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userId', userData.user.id);
        localStorage.setItem('email', userData.user.email);
        localStorage.setItem('role', 'customer');
        localStorage.setItem('username', userData.user.username || '');
        localStorage.setItem('first_name', userData.user.first_name);
        localStorage.setItem('last_name', userData.user.last_name || '');
        navigate('/');
      } else {
        res = await loginEmployee(data);
        console.log('📊 Phản hồi từ API đăng nhập nhân viên:', res.data);
        const employeeData = res.data.data;
        if (!employeeData || !employeeData.employee || !employeeData.employee.id) {
          throw new Error('Dữ liệu nhân viên không hợp lệ');
        }
        // Chuẩn hóa vai trò trước khi lưu
        const employeeRole = employeeData.employee.role.toLowerCase();
        login(employeeData);
        localStorage.setItem('token', employeeData.token);
        localStorage.setItem('userId', employeeData.employee.id);
        localStorage.setItem('email', employeeData.employee.email);
        localStorage.setItem('role', employeeRole);
        localStorage.setItem('first_name', employeeData.employee.first_name || '');
        localStorage.setItem('last_name', employeeData.employee.last_name || '');
        if (employeeRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
      alert('Đăng nhập thành công!');
    } catch (err) {
      console.log('❌ Lỗi đăng nhập:', err);
      if (err.response && err.response.status === 401) {
        setError(err.response.data.error || 'Email hoặc mật khẩu không đúng');
      } else {
        setError('Đăng nhập thất bại: ' + err.message);
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
        <h1 className="text-2xl font-bold mb-4 text-green-600">Đăng nhập</h1>
        {error && (
          <div className="text-center p-4 text-red-500">
            {error}
            <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
          </div>
        )}
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Vai trò</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="customer">Khách hàng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <AuthForm type="login" onSubmit={onSubmit} />
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}

export default Login;