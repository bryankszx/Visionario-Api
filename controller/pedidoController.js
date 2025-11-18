const { Pedido, ItemPedido, Cliente, Produto } = require('../model');
const { Op } = require('sequelize');

const pedidoController = {
  // POST /pedidos - Criar novo pedido (com itens)
  criar: async (req, res) => {
    try {
      const { clienteId, itens } = req.body;

      if (!clienteId || !itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ 
          erro: 'Cliente ID e itens são obrigatórios' 
        });
      }

      // Verificar se cliente existe
      const cliente = await Cliente.findByPk(clienteId);
      if (!cliente) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      // Calcular total e validar produtos
      let total = 0;
      const itensValidados = [];

      for (const item of itens) {
        const { produtoId, quantidade } = item;

        if (!produtoId || !quantidade || quantidade < 1) {
          return res.status(400).json({ 
            erro: 'Cada item deve ter produtoId e quantidade válida' 
          });
        }

        const produto = await Produto.findByPk(produtoId);
        if (!produto) {
          return res.status(404).json({ 
            erro: `Produto com ID ${produtoId} não encontrado` 
          });
        }

        if (produto.estoque < quantidade) {
          return res.status(400).json({ 
            erro: `Estoque insuficiente para o produto ${produto.nome}` 
          });
        }

        const subtotal = produto.preco * quantidade;
        total += subtotal;

        itensValidados.push({
          produtoId,
          quantidade,
          precoUnitario: produto.preco,
          subtotal
        });
      }

      // Criar pedido
      const pedido = await Pedido.create({
        clienteId,
        total,
        status: 'Pendente'
      });

      // Criar itens do pedido e atualizar estoque
      for (const item of itensValidados) {
        await ItemPedido.create({
          pedidoId: pedido.id,
          ...item
        });

        // Atualizar estoque
        const produto = await Produto.findByPk(item.produtoId);
        await produto.update({
          estoque: produto.estoque - item.quantidade
        });
      }

      // Buscar pedido completo com relacionamentos
      const pedidoCompleto = await Pedido.findByPk(pedido.id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { 
            model: ItemPedido, 
            as: 'itens',
            include: [{ model: Produto, as: 'produto' }]
          }
        ]
      });

      return res.status(201).json(pedidoCompleto);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // GET /pedidos - Listar todos
  listar: async (req, res) => {
    try {
      const pedidos = await Pedido.findAll({
        include: [
          { model: Cliente, as: 'cliente' },
          { 
            model: ItemPedido, 
            as: 'itens',
            include: [{ model: Produto, as: 'produto' }]
          }
        ],
        order: [['dataPedido', 'DESC']]
      });
      return res.json(pedidos);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // GET /pedidos/:id - Detalhes do pedido com cliente e itens
  buscar: async (req, res) => {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { 
            model: ItemPedido, 
            as: 'itens',
            include: [{ model: Produto, as: 'produto' }]
          }
        ]
      });

      if (!pedido) {
        return res.status(404).json({ erro: 'Pedido não encontrado' });
      }

      return res.json(pedido);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // PUT /pedidos/:id/status - Atualizar status
  atualizarStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const statusValidos = ['Pendente', 'Pago', 'Cancelado', 'Entregue'];
      
      if (!status || !statusValidos.includes(status)) {
        return res.status(400).json({ 
          erro: `Status inválido. Use: ${statusValidos.join(', ')}` 
        });
      }

      const pedido = await Pedido.findByPk(id, {
        include: [
          { 
            model: ItemPedido, 
            as: 'itens',
            include: [{ model: Produto, as: 'produto' }]
          }
        ]
      });

      if (!pedido) {
        return res.status(404).json({ erro: 'Pedido não encontrado' });
      }

      // Se cancelar pedido, devolver estoque
      if (status === 'Cancelado' && pedido.status !== 'Cancelado') {
        for (const item of pedido.itens) {
          const produto = await Produto.findByPk(item.produtoId);
          await produto.update({
            estoque: produto.estoque + item.quantidade
          });
        }
      }

      await pedido.update({ status });

      const pedidoAtualizado = await Pedido.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { 
            model: ItemPedido, 
            as: 'itens',
            include: [{ model: Produto, as: 'produto' }]
          }
        ]
      });

      return res.json(pedidoAtualizado);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }
};

module.exports = pedidoController;

