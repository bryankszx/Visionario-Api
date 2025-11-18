const express = require('express');
const router = express.Router();
const pedidoController = require('../controller/pedidoController');

router.post('/', pedidoController.criar);
router.get('/', pedidoController.listar);
router.get('/:id', pedidoController.buscar);
router.put('/:id/status', pedidoController.atualizarStatus);

module.exports = router;

