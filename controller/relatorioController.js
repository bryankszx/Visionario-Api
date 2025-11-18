const { Pedido, ItemPedido, Cliente, Produto } = require('../model');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

const relatorioController = {
  // GET /relatorios/faturamento-mensal - Somatório por mês
  faturamentoMensal: async (req, res) => {
    try {
      const { ano } = req.query;
      const anoFiltro = ano || new Date().getFullYear();

      const faturamento = await Pedido.findAll({
        where: {
          status: {
            [Op.in]: ['Pago', 'Entregue']
          },
          dataPedido: {
            [Op.gte]: new Date(`${anoFiltro}-01-01`),
            [Op.lt]: new Date(`${parseInt(anoFiltro) + 1}-01-01`)
          }
        },
        attributes: [
          [sequelize.fn('strftime', '%Y-%m', sequelize.col('dataPedido')), 'mes'],
          [sequelize.fn('SUM', sequelize.col('total')), 'total']
        ],
        group: [sequelize.fn('strftime', '%Y-%m', sequelize.col('dataPedido'))],
        order: [[sequelize.fn('strftime', '%Y-%m', sequelize.col('dataPedido')), 'ASC']],
        raw: true
      });

      // Formatar resultado
      const resultado = faturamento.map(item => ({
        mes: item.mes,
        total: parseFloat(item.total || 0)
      }));

      return res.json({
        ano: anoFiltro,
        faturamento: resultado,
        totalGeral: resultado.reduce((sum, item) => sum + item.total, 0)
      });
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // GET /relatorios/produtos-mais-vendidos - Top produtos
  produtosMaisVendidos: async (req, res) => {
    try {
      const { limite = 10 } = req.query;

      const produtosVendidos = await sequelize.query(`
        SELECT 
          ip.produtoId,
          p.id,
          p.nome,
          p.preco,
          SUM(ip.quantidade) as totalVendido,
          SUM(ip.subtotal) as totalFaturado
        FROM itens_pedido ip
        INNER JOIN pedidos ped ON ip.pedidoId = ped.id
        INNER JOIN produtos p ON ip.produtoId = p.id
        WHERE ped.status IN ('Pago', 'Entregue')
        GROUP BY ip.produtoId, p.id, p.nome, p.preco
        ORDER BY totalVendido DESC
        LIMIT :limite
      `, {
        replacements: { limite: parseInt(limite) },
        type: QueryTypes.SELECT
      });

      const resultado = produtosVendidos.map(item => ({
        produto: {
          id: item.id,
          nome: item.nome,
          preco: parseFloat(item.preco)
        },
        totalVendido: parseInt(item.totalVendido || 0),
        totalFaturado: parseFloat(item.totalFaturado || 0)
      }));

      return res.json(resultado);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // GET /relatorios/clientes-top - Clientes que mais compraram
  clientesTop: async (req, res) => {
    try {
      const { limite = 10 } = req.query;

      const clientesTop = await sequelize.query(`
        SELECT 
          ped.clienteId,
          c.id,
          c.nome,
          c.email,
          COUNT(ped.id) as totalPedidos,
          SUM(ped.total) as totalGasto
        FROM pedidos ped
        INNER JOIN clientes c ON ped.clienteId = c.id
        WHERE ped.status IN ('Pago', 'Entregue')
        GROUP BY ped.clienteId, c.id, c.nome, c.email
        ORDER BY totalGasto DESC
        LIMIT :limite
      `, {
        replacements: { limite: parseInt(limite) },
        type: QueryTypes.SELECT
      });

      const resultado = clientesTop.map(item => ({
        cliente: {
          id: item.id,
          nome: item.nome,
          email: item.email
        },
        totalPedidos: parseInt(item.totalPedidos || 0),
        totalGasto: parseFloat(item.totalGasto || 0)
      }));

      return res.json(resultado);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }
};

module.exports = relatorioController;

