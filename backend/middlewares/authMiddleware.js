const jwt = require('jsonwebtoken');

// Middleware xác thực JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Kiểm tra header có tồn tại và đúng định dạng
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Header Authorization không hợp lệ' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token không tồn tại' });
  }

  // Kiểm tra JWT_SECRET
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, error: 'Lỗi cấu hình server' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token đã hết hạn' });
    }
    return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
  }
};

// Middleware phân quyền theo vai trò
const authorize = (roles) => (req, res, next) => {
  // Đảm bảo vai trò trong token và database đều là lowercase
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Không có quyền truy cập' });
  }
  next();
};

module.exports = { authenticate, authorize };