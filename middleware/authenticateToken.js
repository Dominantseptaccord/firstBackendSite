const jwt = require("jsonwebtoken");
const Data = require("../models/Data");
require("dotenv").config();

const activeSessions = {};

const authenticateToken = async (req, res, next) => {
  try {
      const token = req.cookies.auth_token;
      
      if (!token) {
          const error = new Error('Authentication required');
          error.statusCode = 401;
          throw error;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (activeSessions[decoded.id] !== token) {
          const error = new Error('Session expired');
          error.statusCode = 401;
          throw error;
      }

      const user = await Data.findById(decoded.id);
      if (!user) {
          const error = new Error('User not found');
          error.statusCode = 404;
          throw error;
      }

      req.user = user;
      next();
  } catch (error) {
      if (error.name === 'TokenExpiredError') {
          error.message = 'Session expired';
          error.statusCode = 401;
      }
      next(error);
  }
};

module.exports = { authenticateToken, activeSessions };