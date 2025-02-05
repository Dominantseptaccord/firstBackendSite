const jwt = require("jsonwebtoken");
const Data = require("../models/Data");
require("dotenv").config();

const activeSessions = {};

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.redirect('/signin'); // Перенаправляем на страницу входа
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверяем активность сессии
    if (activeSessions[decoded.id] !== token) {
      return res.redirect('/signin');
    }

    // Получаем полные данные пользователя из базы
    const user = await Data.findById(decoded.id);
    if (!user) {
      return res.redirect('/signin');
    }

    // Добавляем пользователя в запрос
    req.user = user;
    next();
  } catch (error) {
    return res.redirect('/signin');
  }
};

module.exports = { authenticateToken, activeSessions };