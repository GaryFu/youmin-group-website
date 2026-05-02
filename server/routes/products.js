import { Router } from 'express'
import pool from '../db/pool.js'
import auth from '../middleware/auth.js'

const router = Router()

// GET /api/products — paginated, searchable, filterable
router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const search = req.query.search || ''
    const categoryId = parseInt(req.query.category) || 0
    const offset = (page - 1) * limit

    let where = ''
    const params = []
    let paramIdx = 1

    if (search) {
      where += ` AND (pi.name ILIKE $${paramIdx} OR pi.tagline ILIKE $${paramIdx})`
      params.push(`%${search}%`)
      paramIdx++
    }
    if (categoryId) {
      where += ` AND pc.id = $${paramIdx}`
      params.push(categoryId)
      paramIdx++
    }

    // Count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM product_items pi
       JOIN product_subcategories ps ON pi.subcategory_id = ps.id
       JOIN product_categories pc ON ps.category_id = pc.id
       WHERE 1=1 ${where}`,
      params
    )
    const total = parseInt(countResult.rows[0].count)

    // Data
    const dataResult = await pool.query(
      `SELECT pi.*, ps.name as sub_name, pc.name as cat_name, pc.id as cat_id
       FROM product_items pi
       JOIN product_subcategories ps ON pi.subcategory_id = ps.id
       JOIN product_categories pc ON ps.category_id = pc.id
       WHERE 1=1 ${where}
       ORDER BY pc.sort_order, ps.sort_order, pi.sort_order
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    )

    // Get categories for filter dropdown
    const catsResult = await pool.query('SELECT id, name FROM product_categories ORDER BY sort_order')

    res.json({
      products: dataResult.rows,
      categories: catsResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/subcategories — list all subcategories with parent names
router.get('/subcategories', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ps.id, ps.name, pc.name as cat_name
       FROM product_subcategories ps
       JOIN product_categories pc ON ps.category_id = pc.id
       ORDER BY pc.sort_order, ps.sort_order`
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})
// ── Category Management ──
router.get('/categories', auth, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM product_categories ORDER BY sort_order')
    res.json(result.rows)
  } catch (err) { next(err) }
})
router.post('/categories', auth, async (req, res, next) => {
  try {
    const { name, slug, icon, desc } = req.body
    if (!name || !slug) return res.status(400).json({ error: '名称和 slug 为必填项' })
    const result = await pool.query('INSERT INTO product_categories (name, slug, icon, "desc", sort_order) VALUES ($1,$2,$3,$4,0) RETURNING *', [name, slug, icon || 'Package', desc || ''])
    res.json(result.rows[0])
  } catch (err) { next(err) }
})
router.put('/categories/:id', auth, async (req, res, next) => {
  try {
    const { name, slug, icon, desc } = req.body
    await pool.query('UPDATE product_categories SET name=$1, slug=$2, icon=$3, "desc"=$4 WHERE id=$5', [name, slug, icon, desc, req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})
router.delete('/categories/:id', auth, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM product_categories WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})
router.post('/subcategories', auth, async (req, res, next) => {
  try {
    const { name, category_id } = req.body
    if (!name || !category_id) return res.status(400).json({ error: '名称和所属分类为必填项' })
    const result = await pool.query('INSERT INTO product_subcategories (category_id, name, sort_order) VALUES ($1,$2,0) RETURNING *', [category_id, name])
    res.json(result.rows[0])
  } catch (err) { next(err) }
})
router.put('/subcategories/:id', auth, async (req, res, next) => {
  try {
    const { name, category_id } = req.body
    await pool.query('UPDATE product_subcategories SET name=$1, category_id=$2 WHERE id=$3', [name, category_id, req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})
router.delete('/subcategories/:id', auth, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM product_subcategories WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.get('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params

    const prod = await pool.query(
      `SELECT pi.*, ps.name as sub_name, pc.name as cat_name
       FROM product_items pi
       JOIN product_subcategories ps ON pi.subcategory_id = ps.id
       JOIN product_categories pc ON ps.category_id = pc.id
       WHERE pi.id = $1`, [id]
    )
    if (prod.rows.length === 0) return res.status(404).json({ error: '产品不存在' })

    const features = await pool.query('SELECT * FROM product_features WHERE product_id = $1 ORDER BY sort_order', [id])
    const specs = await pool.query('SELECT * FROM product_specs WHERE product_id = $1 ORDER BY sort_order', [id])

    res.json({
      ...prod.rows[0],
      features: features.rows,
      specs: specs.rows,
    })
  } catch (err) {
    next(err)
  }
})

// PUT /api/products/:id — update single product
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, slug, tagline, desc, image, images, url, features, specs } = req.body
    const imageArray = images?.length > 0 ? images : (image ? [image] : [])

    await pool.query(
      `UPDATE product_items SET name=$1, slug=$2, tagline=$3, "desc"=$4, image=$5, images=$6, url=$7 WHERE id=$8`,
      [name, slug, tagline, desc, imageArray[0] || null, JSON.stringify(imageArray), url, id]
    )

    if (Array.isArray(features)) {
      await pool.query('DELETE FROM product_features WHERE product_id = $1', [id])
      for (let i = 0; i < features.length; i++) {
        await pool.query('INSERT INTO product_features (product_id, icon, text, sort_order) VALUES ($1,$2,$3,$4)',
          [id, features[i].icon || 'CheckCircle2', features[i].text, i])
      }
    }

    if (Array.isArray(specs)) {
      await pool.query('DELETE FROM product_specs WHERE product_id = $1', [id])
      for (let i = 0; i < specs.length; i++) {
        await pool.query('INSERT INTO product_specs (product_id, label, value, sort_order) VALUES ($1,$2,$3,$4)',
          [id, specs[i].label, specs[i].value, i])
      }
    }

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// POST /api/products — create new product
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, slug, tagline, desc, image, images, url, subcategory_id, features, specs } = req.body
    const imageArray = images?.length > 0 ? images : (image ? [image] : [])

    if (!name || !subcategory_id) {
      return res.status(400).json({ error: '产品名和子分类为必填项' })
    }

    const result = await pool.query(
      `INSERT INTO product_items (subcategory_id, name, slug, tagline, "desc", image, images, url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0) RETURNING *`,
      [subcategory_id, name, slug || '', tagline || '', desc || '', imageArray[0] || null, JSON.stringify(imageArray), url || '']
    )
    const prodId = result.rows[0].id

    if (Array.isArray(features)) {
      for (let i = 0; i < features.length; i++) {
        await pool.query('INSERT INTO product_features (product_id, icon, text, sort_order) VALUES ($1,$2,$3,$4)',
          [prodId, features[i].icon || 'CheckCircle2', features[i].text, i])
      }
    }
    if (Array.isArray(specs)) {
      for (let i = 0; i < specs.length; i++) {
        await pool.query('INSERT INTO product_specs (product_id, label, value, sort_order) VALUES ($1,$2,$3,$4)',
          [prodId, specs[i].label, specs[i].value, i])
      }
    }

    res.json({ ...result.rows[0], features: features || [], specs: specs || [] })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params
    // CASCADE handles features and specs
    await pool.query('DELETE FROM product_specs WHERE product_id = $1', [id])
    await pool.query('DELETE FROM product_features WHERE product_id = $1', [id])
    await pool.query('DELETE FROM product_items WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// ── Publish ──

// POST /api/publish — manually trigger Vercel redeploy
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

export default router
