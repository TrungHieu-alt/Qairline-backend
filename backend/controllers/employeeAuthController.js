const EmployeeAuthService = require('../services/EmployeeAuthService');

exports.login = async (req, res) => {
  try {
    const result = await EmployeeAuthService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    const status = err.message === 'Email not found' || err.message === 'Incorrect password' ? 401 : 400;
    res.status(status).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Employee logged out successfully' });
};