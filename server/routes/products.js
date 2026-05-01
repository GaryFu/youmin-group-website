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
    const { name, slug, tagline, desc, image, url, features, specs } = req.body

    await pool.query(
      `UPDATE product_items SET name=$1, slug=$2, tagline=$3, "desc"=$4, image=$5, url=$6 WHERE id=$7`,
      [name, slug, tagline, desc, image, url, id]
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
    const { name, slug, tagline, desc, image, url, subcategory_id, features, specs } = req.body

    if (!name || !subcategory_id) {
      return res.status(400).json({ error: '产品名和子分类为必填项' })
    }

    const result = await pool.query(
      `INSERT INTO product_items (subcategory_id, name, slug, tagline, "desc", image, url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,0) RETURNING *`,
      [subcategory_id, name, slug || '', tagline || '', desc || '', image || '', url || '']
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

export default router
