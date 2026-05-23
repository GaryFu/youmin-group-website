import { Router } from 'express'
import pool from '../db/pool.js'
import auth from '../middleware/auth.js'
import { ensureNewsImagesColumn, normalizeNewsImages } from '../db/newsImages.js'

const router = Router()

// GET /api/news — paginated, searchable
router.get('/', async (req, res, next) => {
  try {
    await ensureNewsImagesColumn()
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

// POST /api/news/publish — manually trigger Vercel redeploy
router.post('/publish', auth, async (req, res) => {
  if (!process.env.DEPLOY_HOOK_URL) {
    return res.status(400).json({ error: '未配置 DEPLOY_HOOK_URL' })
  }
  try {
    await fetch(process.env.DEPLOY_HOOK_URL, { method: 'POST' })
    res.json({ message: '部署已触发，约1分钟后生效' })
  } catch (err) {
    res.status(500).json({ error: '触发部署失败' })
  }
})

// GET /api/news/:id — single article
router.get('/:id', async (req, res, next) => {
  try {
    await ensureNewsImagesColumn()
    const result = await pool.query('SELECT * FROM news_articles WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: '文章不存在' })
    res.json(result.rows[0])
  } catch (err) { next(err) }
})

// PUT /api/news/:id — update article
router.put('/:id', auth, async (req, res, next) => {
  try {
    await ensureNewsImagesColumn()
    const { title, digest, content, cover, images, category, date } = req.body
    const imageArray = normalizeNewsImages({ images, cover })
    await pool.query(
      'UPDATE news_articles SET title=$1, digest=$2, content=$3, url=$4, cover=$5, images=$6, category=$7, date=$8 WHERE id=$9',
      [title, digest || '', content || '', '', imageArray[0] || '', JSON.stringify(imageArray), category || '集团新闻', date, req.params.id]
    )
    res.json({ success: true })
  } catch (err) { next(err) }
})

// POST /api/news — create article
router.post('/', auth, async (req, res, next) => {
  try {
    await ensureNewsImagesColumn()
    const { title, digest, content, cover, images, category, date } = req.body
    const imageArray = normalizeNewsImages({ images, cover })
    const result = await pool.query(
      'INSERT INTO news_articles (title, digest, content, url, cover, images, category, date, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0) RETURNING *',
      [title, digest || '', content || '', '', imageArray[0] || '', JSON.stringify(imageArray), category || '集团新闻', date || new Date().toISOString().slice(0, 10)]
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
