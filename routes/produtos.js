const express = require('express');
const router = express.Router();
const produtoController = require('../controller/produtoController');

router.post('/', produtoController.criar);
router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscar);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.deletar);

module.exports = router;

