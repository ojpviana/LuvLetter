/**
 * Global error handling middleware.
 * Formats all unhandled errors into a consistent JSON response.
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message || err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Arquivo muito grande. Tamanho máximo: 10MB por foto.' });
  }

  // Multer file count error
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({ error: 'Máximo de 6 fotos permitidas.' });
  }

  // Multer unexpected field
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Campo de arquivo inesperado.' });
  }

  // Prisma not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado.' });
  }

  // Prisma unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Conflito: registro duplicado.' });
  }

  // Groq / external API errors
  if (err.status === 429) {
    return res.status(429).json({ error: 'Limite de requisições atingido. Tente novamente em alguns segundos.' });
  }

  if (err.status === 401 || err.status === 403) {
    return res.status(502).json({ error: 'Erro de autenticação com serviço externo.' });
  }

  // Generic server error
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    error: err.message || 'Erro interno do servidor.',
  });
}

module.exports = errorHandler;
