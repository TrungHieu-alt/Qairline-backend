import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');
    const first_name = localStorage.getItem('first_name');
    const last_name = localStorage.getItem('last_name');
    return token && userId && role
      ? { id: userId, role, email, username, first_name, last_name }
      : null;
  });

  const login = (userData) => {
  // Lấy thông tin người dùng từ user hoặc employee
  const userInfo = userData.user || userData.employee;
  
  // Kiểm tra dữ liệu hợp lệ
  if (!userInfo || !userInfo.id) {
    throw new Error('Dữ liệu người dùng không hợp lệ');
  }

  // Lưu thông tin vào localStorage
  localStorage.setItem('token', userData.token);
  localStorage.setItem('userId', userInfo.id);
  localStorage.setItem('email', userInfo.email);
  localStorage.setItem('role', (userInfo.role || 'customer').toLowerCase());
  localStorage.setItem('first_name', userInfo.first_name || '');
  localStorage.setItem('last_name', userInfo.last_name || '');

  // Cập nhật trạng thái user
  setUser({
    id: userInfo.id,
    role: (userInfo.role || 'customer').toLowerCase(),
    email: userInfo.email,
    first_name: userInfo.first_name,
    last_name: userInfo.last_name
  });
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}