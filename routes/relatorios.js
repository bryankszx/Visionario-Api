const express = require('express');
const router = express.Router();
const relatorioController = require('../controller/relatorioController');

router.get('/faturamento-mensal', relatorioController.faturamentoMensal);
router.get('/produtos-mais-vendidos', relatorioController.produtosMaisVendidos);
router.get('/clientes-top', relatorioController.clientesTop);

module.exports = router;

