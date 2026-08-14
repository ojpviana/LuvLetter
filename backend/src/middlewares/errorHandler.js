function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message || err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Arquivo muito grande. Tamanho máximo: 10MB por foto.' });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({ error: 'Máximo de 6 fotos permitidas.' });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Campo de arquivo inesperado.' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado.' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Conflito: registro duplicado.' });
  }

  if (err.status === 429) {
    return res.status(429).json({ error: 'Limite de requisições atingido. Tente novamente em alguns segundos.' });
  }

  if (err.status === 401 || err.status === 403) {
    return res.status(502).json({ error: 'Erro de autenticação com serviço externo.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    error: err.message || 'Erro interno do servidor.',
  });
}

module.exports = errorHandler;
