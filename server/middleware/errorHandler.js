export function errorHandler(err, req, res, _next) {
  console.error('Server error:', err)
  if (err.code === '23505') {
    return res.status(409).json({
      error: '保存失败：同一分类下已存在相同标识的数据，请稍后重试或调整名称。',
    })
  }

  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
  })
}
