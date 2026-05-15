function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') ?? 'field';
    return res.status(409).json({ error: `A record with that ${field} already exists.` });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
