const AuthService = require('../services/AuthService');

class AuthController {
  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body.email, req.body.password);
      // AuthService should return token and user info on success
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      // AuthService should throw specific errors like 'Email not found' or 'Incorrect password'
      throw error;
    }
  }

  async registerPassenger(req, res, next) {
    try {
      const result = await AuthService.registerPassenger(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      // AuthService should throw errors
      next(error); // Pass to error handling middleware
    }
  }

  async registerAdmin(req, res, next) {
    try {
      const result = await AuthService.registerAdmin(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      // AuthService should throw errors
      next(error); // Pass to error handling middleware
    }
  }

  async logout(req, res, next) {
    try {
      // Assuming user ID is available in req.user after authentication middleware
      const result = await AuthService.logout(req.user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const result = await AuthService.refreshToken(req.body.refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const result = await AuthService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();