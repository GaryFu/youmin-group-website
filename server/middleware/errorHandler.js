export function errorHandler(err, req, res, _next) {
  console.error('Server error:', err)
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
  })
}
