const Employee = require('../models/Employee');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const result = await db.query(
      'SELECT id, email, password_hash, first_name, role FROM employees WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Email not found');
    }

    const employee = result.rows[0];
    const match = await bcrypt.compare(password, employee.password_hash);
    if (!match) {
      throw new Error('Incorrect password');
    }

    const token = jwt.sign(
      { id: employee.id, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    return { token, employee: new Employee(employee) };
  }
}
module.exports = new AuthService();