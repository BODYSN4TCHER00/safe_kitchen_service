const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Mismo secret que generateToken
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });
      next();
    } catch (error) {
      console.error('Error en verificación de token:', error);
      res.status(401).json({ message: 'Token inválido' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'Autenticación requerida' });
  }
};

module.exports = { protect };