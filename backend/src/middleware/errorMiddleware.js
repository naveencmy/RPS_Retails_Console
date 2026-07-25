module.exports = (err, req, res, next) => {
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  })

  const status = err.status || 500

  if (status === 500) {
    return res.status(500).json({ message: 'Internal server error' })
  }

  res.status(status).json({ message: err.message || 'Request failed' })
}
