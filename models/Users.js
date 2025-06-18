const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
const bcrypt = require('bcryptjs');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Sincronizar el modelo (opcional, solo para desarrollo)
User.sync({ alter: true })
  .then(() => console.log('✅ Modelo de usuarios sincronizado'))
  .catch(err => console.error('❌ Error al sincronizar modelo:', err));

module.exports = User;