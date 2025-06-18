const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const { protect } = require('../middleware/auth');
const generateToken = require('../config/jwt'); 

// Registro de usuario
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password_hash: password });
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(400).json({ message: 'Error en registro', error: error.message });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  
  if (user && (await user.validPassword(password))) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id) // Usamos la misma función
    });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});

// Ruta protegida
router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;