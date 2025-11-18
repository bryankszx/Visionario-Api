const { Cliente } = require('../model');

const clienteController = {
  // POST /clientes - Cadastrar cliente
  criar: async (req, res) => {
    try {
      const { nome, email, telefone, endereco, cpf } = req.body;

      if (!nome || !email) {
        return res.status(400).json({ 
          erro: 'Nome e email são obrigatórios' 
        });
      }

      const cliente = await Cliente.create({
        nome,
        email,
        telefone,
        endereco,
        cpf
      });

      return res.status(201).json(cliente);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          erro: 'Email ou CPF já cadastrado' 
        });
      }
      return res.status(500).json({ erro: error.message });
    }
  },

  // GET /clientes - Listar todos
  listar: async (req, res) => {
    try {
      const clientes = await Cliente.findAll({
        order: [['nome', 'ASC']]
      });
      return res.json(clientes);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // GET /clientes/:id - Buscar cliente
  buscar: async (req, res) => {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      return res.json(cliente);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // PUT /clientes/:id - Atualizar cliente
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, email, telefone, endereco, cpf } = req.body;

      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      await cliente.update({
        nome: nome || cliente.nome,
        email: email || cliente.email,
        telefone: telefone !== undefined ? telefone : cliente.telefone,
        endereco: endereco !== undefined ? endereco : cliente.endereco,
        cpf: cpf !== undefined ? cpf : cliente.cpf
      });

      return res.json(cliente);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          erro: 'Email ou CPF já cadastrado' 
        });
      }
      return res.status(500).json({ erro: error.message });
    }
  },

  // DELETE /clientes/:id - Apagar cliente
  deletar: async (req, res) => {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      await cliente.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }
};

module.exports = clienteController;

