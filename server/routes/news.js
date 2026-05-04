import { Router } from 'express'
import pool from '../db/pool.js'
import auth from '../middleware/auth.js'

const router = Router()

// GET /api/news — paginated, searchable
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const search = req.query.search || ''
    const category = req.query.category || ''
    const offset = (page - 1) * limit

    let where = ''
    const params = []
    let idx = 1

    if (search) {
      where += ` AND (title ILIKE $${idx} OR digest ILIKE $${idx})`
      params.push(`%${search}%`)
      idx++
    }
    if (category) {
      where += ` AND category = $${idx}`
      params.push(category)
      idx++
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM news_articles WHERE 1=1 ${where}`, params)
    const total = parseInt(countResult.rows[0].count)

    const dataResult = await pool.query(
      `SELECT * FROM news_articles WHERE 1=1 ${where} ORDER BY date DESC, sort_order ASC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    )

    const catsResult = await pool.query('SELECT DISTINCT category FROM news_articles ORDER BY category')

    res.json({
      articles: dataResult.rows,
      categories: catsResult.rows.map(r => r.category),
      total, page, limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) { next(err) }
})

// GET /api/news/:id — single article
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM news_articles WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: '文章不存在' })
    res.json(result.rows[0])
  } catch (err) { next(err) }
})

// PUT /api/news/:id — update article
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { title, digest, content, url, cover, category, date } = req.body
    await pool.query(
      'UPDATE news_articles SET title=$1, digest=$2, content=$3, url=$4, cover=$5, category=$6, date=$7 WHERE id=$8',
      [title, digest || '', content || '', url || '', cover || '', category || '集团新闻', date, req.params.id]
    )
    res.json({ success: true })
  } catch (err) { next(err) }
})

// POST /api/news — create article
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, digest, content, url, cover, category, date } = req.body
    const result = await pool.query(
      'INSERT INTO news_articles (title, digest, content, url, cover, category, date, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,0) RETURNING *',
      [title, digest || '', content || '', url || '', cover || '', category || '集团新闻', date || new Date().toISOString().slice(0, 10)]
    )
    res.json(result.rows[0])
  } catch (err) { next(err) }
})

// DELETE /api/news/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM news_articles WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router
