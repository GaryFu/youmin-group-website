import crypto from 'node:crypto'
import { Router } from 'express'
import pool from '../db/pool.js'
import { comparePassword, hashPassword } from '../utils/hash.js'
import { signToken } from '../utils/jwt.js'
import auth from '../middleware/auth.js'
import { sendPasswordResetEmail } from '../utils/email.js'

const router = Router()

// POST /login — accepts username OR email in the "login" field
router.post('/login', async (req, res, next) => {
  try {
    const { login, password } = req.body

    if (!login || !password) {
      return res.status(400).json({ error: '请输入用户名/邮箱和密码' })
    }

    const result = await pool.query(
      'SELECT id, username, email, password_hash FROM admin_users WHERE username = $1 OR email = $1',
      [login]
    )

    const user = result.rows[0]

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const token = signToken({ userId: user.id, username: user.username, email: user.email })

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: 'admin' },
    })
  } catch (err) {
    next(err)
  }
})

// GET /me — validate token and return current user
router.get('/me', auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email FROM admin_users WHERE id = $1',
      [req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户不存在' })
    }

    const user = result.rows[0]
    res.json({ user: { id: user.id, username: user.username, email: user.email, role: 'admin' } })
  } catch (err) {
    next(err)
  }
})

// POST /forgot-password — send reset email
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: '请输入邮箱地址' })
    }

    const result = await pool.query('SELECT id, username, email FROM admin_users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      // Don't reveal whether email exists
      return res.json({ message: '如果该邮箱已注册，您将收到一封密码重置邮件' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 30 * 60 * 1000) // 30 min

    await pool.query(
      'UPDATE admin_users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [token, expires, result.rows[0].id]
    )

    const siteUrl = process.env.SITE_URL || 'http://localhost:5173'
    const resetUrl = `${siteUrl}/admin/reset-password?token=${token}`

    await sendPasswordResetEmail(email, resetUrl)

    res.json({ message: '如果该邮箱已注册，您将收到一封密码重置邮件' })
  } catch (err) {
    next(err)
  }
})

// POST /reset-password — reset password with token
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ error: '请提供重置令牌和新密码' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '密码长度不能少于6位' })
    }

    const result = await pool.query(
      'SELECT id FROM admin_users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ error: '重置链接已过期或无效' })
    }

    const passwordHash = await hashPassword(newPassword)

    await pool.query(
      'UPDATE admin_users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [passwordHash, result.rows[0].id]
    )

    res.json({ message: '密码已重置，请使用新密码登录' })
  } catch (err) {
    next(err)
  }
})

// PUT /profile — update email, username, or password (requires auth + current password)
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { email, username, currentPassword, newPassword } = req.body
    const userId = req.user.userId

    const userResult = await pool.query('SELECT * FROM admin_users WHERE id = $1', [userId])
    const user = userResult.rows[0]

    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // If changing password, require current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: '请输入当前密码' })
      }
      if (!(await comparePassword(currentPassword, user.password_hash))) {
        return res.status(400).json({ error: '当前密码不正确' })
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: '新密码长度不能少于6位' })
      }
      const passwordHash = await hashPassword(newPassword)
      await pool.query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [passwordHash, userId])
    }

    // Update email
    if (email && email !== user.email) {
      // Check if email already taken
      const emailCheck = await pool.query(
        'SELECT id FROM admin_users WHERE email = $1 AND id != $2',
        [email, userId]
      )
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: '该邮箱已被使用' })
      }
      await pool.query('UPDATE admin_users SET email = $1 WHERE id = $2', [email, userId])
    }

    // Update username
    if (username && username !== user.username) {
      const usernameCheck = await pool.query(
        'SELECT id FROM admin_users WHERE username = $1 AND id != $2',
        [username, userId]
      )
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ error: '该用户名已被使用' })
      }
      await pool.query('UPDATE admin_users SET username = $1 WHERE id = $2', [username, userId])
    }

    // Return updated user
    const updated = await pool.query(
      'SELECT id, username, email FROM admin_users WHERE id = $1',
      [userId]
    )

    res.json({ user: { ...updated.rows[0], role: 'admin' } })
  } catch (err) {
    next(err)
  }
})

export default router
