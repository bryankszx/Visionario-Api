/*
 * ============================================
 * INSTALAÇÃO DE DEPENDÊNCIAS
 * ============================================
 * 
 * Execute no terminal para instalar todas as dependências:
 * npm install
 * 
 * 
 * npm install express
 * npm install cors
 * npm install dotenv
 * npm install sequelize
 * npm install sqlite3
 * 

 * ============================================
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { syncDatabase } = require('./model');
const errorHandler = require('./middleware/errorHandler');

// Importar rotas
const clientesRoutes = require('./routes/clientes');
const produtosRoutes = require('./routes/produtos');
const pedidosRoutes = require('./routes/pedidos');
const relatoriosRoutes = require('./routes/relatorios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/clientes', clientesRoutes);
app.use('/produtos', produtosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/relatorios', relatoriosRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Visionariy - Sistema de Gestão de Vendas',
    versao: '1.0.0',
    endpoints: {
      clientes: '/clientes',
      produtos: '/produtos',
      pedidos: '/pedidos',
      relatorios: '/relatorios'
    }
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicializar servidor
const iniciarServidor = async () => {
  try {
    // Sincronizar banco de dados
    await syncDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 API disponível em http://localhost:${PORT}`);
      console.log(`\n📋 Endpoints disponíveis:`);
      console.log(`   👤 Clientes: http://localhost:${PORT}/clientes`);
      console.log(`   📦 Produtos: http://localhost:${PORT}/produtos`);
      console.log(`   📜 Pedidos: http://localhost:${PORT}/pedidos`);
      console.log(`   📊 Relatórios: http://localhost:${PORT}/relatorios`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();

module.exports = app;

