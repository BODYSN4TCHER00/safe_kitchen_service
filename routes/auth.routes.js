const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const { generateToken, validateRegistration, validateLogin } = require('../middleware/auth');

// Registro de usuario
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear nuevo usuario
    const newUser = await User.create({
      name,
      email,
      password,
      phone_number
    });

    // Generar token
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Login de usuario
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user.id);

    // Remover password_hash de la respuesta
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;