const express = require('express');
const router = express.Router();
const Device = require('../models/devices');
const { protect } = require('../middleware/auth');

// Crear un nuevo device
router.post('/', protect, async (req, res) => {
  const { name } = req.body;

  try {
    const crypto = require('crypto');
    const apiKey = crypto.randomBytes(32).toString('hex');

    const device = await Device.create({
      name,
      user_id: req.user.id,
      api_key: apiKey
    });

    res.status(201).json({
      id: device.id,
      name: device.name,
      user_id: device.user_id,
      api_key: device.api_key,
      created_at: device.created_at
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creando device', error: error.message });
  }
});

// Obtener todos los devices del usuario autenticado
router.get('/', protect, async (req, res) => {
  try {
    const devices = await Device.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo devices', error: error.message });
  }
});

// Obtener un device específico del usuario
router.get('/:id', protect, async (req, res) => {
  try {
    const device = await Device.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    if (!device) {
      return res.status(404).json({ message: 'Device no encontrado' });
    }

    res.json(device);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo device', error: error.message });
  }
});

// Actualizar un device
router.put('/:id', protect, async (req, res) => {
  const { name } = req.body;

  try {
    const [updatedRowsCount] = await Device.update(
      { name },
      {
        where: { 
          id: req.params.id,
          user_id: req.user.id 
        }
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Device no encontrado' });
    }

    const updatedDevice = await Device.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    res.json(updatedDevice);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando device', error: error.message });
  }
});

// Eliminar un device
router.delete('/:id', protect, async (req, res) => {
  try {
    const deletedRowsCount = await Device.destroy({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Device no encontrado' });
    }

    res.json({ message: 'Device eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando device', error: error.message });
  }
});

// Regenerar API key de un device
router.put('/:id/regenerate-key', protect, async (req, res) => {
  const crypto = require('crypto');
  
  try {
    const newApiKey = crypto.randomBytes(32).toString('hex');
    
    const [updatedRowsCount] = await Device.update(
      { api_key: newApiKey },
      {
        where: { 
          id: req.params.id,
          user_id: req.user.id 
        }
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Device no encontrado' });
    }

    const updatedDevice = await Device.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    res.json(updatedDevice);
  } catch (error) {
    res.status(500).json({ message: 'Error regenerando API key', error: error.message });
  }
});

module.exports = router;