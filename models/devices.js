const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  api_key: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'devices',
  timestamps: false
});

// Relación con User
Device.associate = (models) => {
  Device.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

module.exports = Device;

Device.associate = (models) => {
  Device.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  Device.hasMany(models.Sensor, {
    foreignKey: 'device_id',
    as: 'sensors',        
    onDelete: 'CASCADE'

  });
};