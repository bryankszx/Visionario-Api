const { Produto } = require('../model');

const produtoController = {
  // POST /produtos - Cadastrar produto
  criar: async (req, res) => {
    try {
      const { nome, descricao, preco, estoque, categoria } = req.body;

      if (!nome || preco === undefined) {
        return res.status(400).json({ 
          erro: 'Nome e preço são obrigatórios' 
        });
      }

      if (preco < 0) {
        return res.status(400).json({ 
          erro: 'Preço não pode ser negativo' 
        });
      }

      const produto = await Produto.create({
        nome,
        descricao,
        preco,
        estoque: estoque || 0,
        categoria
      });

      return res.status(201).json(produto);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // GET /produtos - Listar todos
  listar: async (req, res) => {
    try {
      const produtos = await Produto.findAll({
        order: [['nome', 'ASC']]
      });
      return res.json(produtos);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // GET /produtos/:id - Buscar produto
  buscar: async (req, res) => {
    try {
      const { id } = req.params;
      const produto = await Produto.findByPk(id);

      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }

      return res.json(produto);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // PUT /produtos/:id - Atualizar produto
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, estoque, categoria } = req.body;

      const produto = await Produto.findByPk(id);

      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }

      if (preco !== undefined && preco < 0) {
        return res.status(400).json({ 
          erro: 'Preço não pode ser negativo' 
        });
      }

      await produto.update({
        nome: nome || produto.nome,
        descricao: descricao !== undefined ? descricao : produto.descricao,
        preco: preco !== undefined ? preco : produto.preco,
        estoque: estoque !== undefined ? estoque : produto.estoque,
        categoria: categoria !== undefined ? categoria : produto.categoria
      });

      return res.json(produto);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // DELETE /produtos/:id - Apagar produto
  deletar: async (req, res) => {
    try {
      const { id } = req.params;
      const produto = await Produto.findByPk(id);

      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }

      await produto.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }
};

module.exports = produtoController;

