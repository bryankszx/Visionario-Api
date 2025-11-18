const sequelize = require('../config/database');
const Cliente = require('./Cliente');
const Produto = require('./Produto');
const Pedido = require('./Pedido');
const ItemPedido = require('./ItemPedido');

// Definir relacionamentos
Cliente.hasMany(Pedido, { foreignKey: 'clienteId', as: 'pedidos' });
Pedido.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

Pedido.hasMany(ItemPedido, { foreignKey: 'pedidoId', as: 'itens' });
ItemPedido.belongsTo(Pedido, { foreignKey: 'pedidoId', as: 'pedido' });

Produto.hasMany(ItemPedido, { foreignKey: 'produtoId', as: 'itensPedido' });
ItemPedido.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' });

// Sincronizar banco de dados
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ Banco de dados sincronizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error);
  }
};

module.exports = {
  sequelize,
  Cliente,
  Produto,
  Pedido,
  ItemPedido,
  syncDatabase
};

