const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Проверка наличия токена в заголовках
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Проверка наличия токена
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Нет доступа к этому ресурсу'
    });
  }

  try {
    // Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Получение пользователя из базы данных
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь с данным токеном не найден'
      });
    }

    // Добавление пользователя в запрос
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Нет доступа к этому ресурсу'
    });
  }
}; 