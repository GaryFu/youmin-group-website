import { Router } from 'express'
import pool from '../db/pool.js'
import auth from '../middleware/auth.js'

const VALID_KEYS = [
  'site', 'home', 'about', 'industry', 'innovation',
  'products', 'green', 'culture', 'news', 'partners', 'contact',
]

const router = Router()

router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params

    if (!VALID_KEYS.includes(key)) {
      return res.status(404).json({ error: '内容不存在' })
    }

    const result = await pool.query('SELECT key, data, updated_at FROM content WHERE key = $1', [key])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '内容不存在', key })
    }

    const row = result.rows[0]
    res.json({ key: row.key, data: row.data, updatedAt: row.updated_at })
  } catch (err) {
    next(err)
  }
})

router.put('/:key', auth, async (req, res, next) => {
  try {
    const { key } = req.params
    const { data } = req.body

    if (!VALID_KEYS.includes(key)) {
      return res.status(400).json({ error: '无效的内容键' })
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: '无效的数据格式' })
    }

    const result = await pool.query(
      `INSERT INTO content (key, data) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET data = $2
       RETURNING key, data, updated_at`,
      [key, JSON.stringify(data)]
    )

    const row = result.rows[0]
    res.json({ key: row.key, data: row.data, updatedAt: row.updated_at })

    // Fire-and-forget: trigger Vercel rebuild for static regeneration
    if (process.env.DEPLOY_HOOK_URL) {
      fetch(process.env.DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {})
    }
  } catch (err) {
    next(err)
  }
})

export default router
