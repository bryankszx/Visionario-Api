const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  endereco: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  }
}, {
  tableName: 'clientes',
  timestamps: true
});

module.exports = Cliente;

