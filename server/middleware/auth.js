import { verifyToken } from '../utils/jwt.js'

export default function auth(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' })
  }

  const token = header.slice(7)

  try {
    const decoded = verifyToken(token)
    req.user = { userId: decoded.userId, email: decoded.email }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '登录已过期，请重新登录' })
    }
    return res.status(401).json({ error: '未登录' })
  }
}
