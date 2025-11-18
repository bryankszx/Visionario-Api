const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);
  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      erro: 'Erro de validação',
      detalhes: err.errors.map(e => e.message)
    });
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      erro: 'Erro no banco de dados',
      mensagem: err.message
    });
  }

  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor'
  });
};

module.exports = errorHandler;

