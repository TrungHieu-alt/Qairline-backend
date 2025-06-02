const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

class CustomerAuthService {
  async login(email, password) {
    console.log('📡 Đăng nhập khách hàng với email:', email); // Thêm log
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const res = await db.query(
      'SELECT id, email, password_hash, first_name, last_name, username FROM customers WHERE email = $1',
      [email]
    );

    if (res.rows.length === 0) {
      throw new Error('Email not found');
    }

    const user = res.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new Error('Incorrect password');
    }

    const token = jwt.sign(
      { id: user.id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name
      }
    };
  }

  async register({ username, email, password, first_name, last_name }) {
    console.log('📡 Đăng ký khách hàng với dữ liệu:', { username, email, first_name, last_name }); // Thêm log
    if (!email || !password || !first_name) {
      throw new Error('Email, password, and first name are required');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Kiểm tra email trùng lặp
    const existingUser = await db.query(
      'SELECT id, password_hash FROM customers WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      if (existingUser.rows[0].password_hash) {
        throw new Error('Email already registered. Please log in or reset password.');
      }
      return await this.linkAccount({ username, email, password, first_name, last_name });
    }

    // Kiểm tra username trùng lặp (nếu có)
    if (username) {
      const existingUsername = await db.query(
        'SELECT id FROM customers WHERE username = $1',
        [username]
      );
      if (existingUsername.rows.length > 0) {
        throw new Error('Username already taken');
      }
    }

    // Băm mật khẩu
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Chèn khách hàng với thông tin tối thiểu
    const result = await db.query(
      'INSERT INTO customers (username, email, password_hash, first_name, last_name, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, username, email, first_name, last_name',
      [username || null, email, password_hash, first_name, last_name]
    );

    const user = result.rows[0];

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: { id: user.id, username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name }
    };
  }

  async linkAccount({ username, email, password, first_name, last_name }) {
    console.log('📡 Liên kết tài khoản khách hàng với email:', email); // Thêm log
    if (!email || !password || !first_name) {
      throw new Error('Email, password, and first name are required');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Kiểm tra username trùng lặp (nếu có)
    if (username) {
      const existingUsername = await db.query(
        'SELECT id FROM customers WHERE username = $1',
        [username]
      );
      if (existingUsername.rows.length > 0) {
        throw new Error('Username already taken');
      }
    }

    // Băm mật khẩu
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Cập nhật password_hash và thông tin cho khách hàng hiện có
    const result = await db.query(
      'UPDATE customers SET username = COALESCE($1, username), password_hash = $2, first_name = COALESCE($3, first_name), last_name = COALESCE($4, last_name) WHERE email = $5 RETURNING id, username, email, first_name, last_name',
      [username || null, password_hash, first_name, last_name, email]
    );

    if (result.rows.length === 0) {
      throw new Error('Customer not found');
    }

    const user = result.rows[0];

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: { id: user.id, username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name }
    };
  }
}

module.exports = new CustomerAuthService();