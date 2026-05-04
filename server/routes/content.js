import { Router } from 'express'
import pool from '../db/pool.js'
import auth from '../middleware/auth.js'

const JSONB_KEYS = ['site', 'home', 'about', 'culture', 'industry', 'innovation', 'green', 'partners', 'contact']

const router = Router()

// ── JSONB content (unchanged for site, home, about, etc.) ──
router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params

    if (key === 'news') return getNews(req, res, next)
    if (key === 'products') return getProducts(req, res, next)

    if (!JSONB_KEYS.includes(key)) return res.status(404).json({ error: '内容不存在' })

    const result = await pool.query('SELECT key, data, updated_at FROM content WHERE key = $1', [key])
    if (result.rows.length === 0) return res.status(404).json({ error: '内容不存在', key })

    const row = result.rows[0]
    res.json({ key: row.key, data: row.data, updatedAt: row.updated_at })
  } catch (err) { next(err) }
})

router.put('/:key', auth, async (req, res, next) => {
  try {
    const { key } = req.params
    const { data } = req.body

    if (key === 'news') return putNews(req, res, next)
    if (key === 'products') return putProducts(req, res, next)

    if (!JSONB_KEYS.includes(key)) return res.status(400).json({ error: '无效的内容键' })
    if (!data || typeof data !== 'object') return res.status(400).json({ error: '无效的数据格式' })

    const result = await pool.query(
      `INSERT INTO content (key, data) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET data = $2 RETURNING key, data, updated_at`,
      [key, JSON.stringify(data)]
    )
    const row = result.rows[0]
    console.log(`Content saved: key=${key}, updatedAt=${row.updated_at}`)
    res.json({ key: row.key, data: row.data, updatedAt: row.updated_at })

    if (process.env.DEPLOY_HOOK_URL) fetch(process.env.DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {})
  } catch (err) { next(err) }
})

// ── News (relational) ──
async function getNews(req, res, next) {
  try {
    const jsonb = await pool.query("SELECT data FROM content WHERE key = 'news'")
    const pageData = jsonb.rows[0]?.data || { title: '新闻动态', subtitle: 'NEWS & UPDATES' }
    const articles = await pool.query('SELECT id, title, digest, content, url, cover, category, date FROM news_articles ORDER BY date DESC, sort_order ASC')
    res.json({ key: 'news', data: { ...pageData, articles: articles.rows }, updatedAt: new Date().toISOString() })
  } catch (err) { next(err) }
}

async function putNews(req, res, next) {
  try {
    const { data } = req.body
    if (!data || typeof data !== 'object') return res.status(400).json({ error: '无效的数据格式' })

    const { title, subtitle, articles } = data
    // Upsert page metadata
    await pool.query(
      "INSERT INTO content (key, data) VALUES ('news', $1) ON CONFLICT (key) DO UPDATE SET data = $1",
      [JSON.stringify({ title, subtitle })]
    )
    // Sync articles: delete and re-insert
    if (Array.isArray(articles)) {
      // Batch upsert: delete removed, insert/update changed
      const existing = await pool.query('SELECT id FROM news_articles')
      const existingIds = new Set(existing.rows.map(r => r.id))
      const updatedIds = new Set()

      for (let i = 0; i < articles.length; i++) {
        const a = articles[i]
        if (a.id) {
          updatedIds.add(a.id)
          await pool.query(
            'UPDATE news_articles SET title=$1, digest=$2, url=$3, cover=$4, category=$5, date=$6, sort_order=$7 WHERE id=$8',
            [a.title, a.digest || '', a.url || '', a.cover || '', a.category || '集团新闻', a.date, i, a.id]
          )
        } else {
          const result = await pool.query(
            'INSERT INTO news_articles (title, digest, url, cover, category, date, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
            [a.title, a.digest || '', a.url || '', a.cover || '', a.category || '集团新闻', a.date, i]
          )
          updatedIds.add(result.rows[0].id)
        }
      }
      // Delete removed
      for (const id of existingIds) {
        if (!updatedIds.has(id)) await pool.query('DELETE FROM news_articles WHERE id = $1', [id])
      }
    }

    res.json({ key: 'news', success: true })
    if (process.env.DEPLOY_HOOK_URL) fetch(process.env.DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {})
  } catch (err) { next(err) }
}

// ── Products (relational) ──
async function getProducts(req, res, next) {
  try {
    const jsonb = await pool.query("SELECT data FROM content WHERE key = 'products'")
    const pageData = jsonb.rows[0]?.data || { title: '产品与服务', subtitle: 'PRODUCTS & SERVICES' }
    const { title, subtitle } = pageData

    // Query relational structure
    const cats = await pool.query('SELECT * FROM product_categories ORDER BY sort_order')
    const categories = []

    for (const cat of cats.rows) {
      const subs = await pool.query('SELECT * FROM product_subcategories WHERE category_id = $1 ORDER BY sort_order', [cat.id])
      const subCategories = []

      for (const sub of subs.rows) {
        const items = await pool.query('SELECT * FROM product_items WHERE subcategory_id = $1 ORDER BY sort_order', [sub.id])
        const products = []

        for (const item of items.rows) {
          const features = await pool.query('SELECT icon, text FROM product_features WHERE product_id = $1 ORDER BY sort_order', [item.id])
          const specs = await pool.query('SELECT label, value FROM product_specs WHERE product_id = $1 ORDER BY sort_order', [item.id])
          products.push({
            ...item,
            desc: item.desc,
            features: features.rows,
            specs: specs.rows,
            // Also include relatedArticles from JSONB for now
            relatedArticles: [],
          })
        }

        subCategories.push({ name: sub.name, products })
      }

      categories.push({
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        desc: cat.desc,
        detailDescription: cat.detail_description,
        items: [],
        subCategories,
        relatedArticles: [],
      })
    }

    // Merge relatedArticles from JSONB
    if (pageData.categories) {
      for (let i = 0; i < categories.length; i++) {
        if (pageData.categories[i]?.relatedArticles) {
          categories[i].relatedArticles = pageData.categories[i].relatedArticles
        }
      }
    }

    res.json({ key: 'products', data: { title, subtitle, categories }, updatedAt: new Date().toISOString() })
  } catch (err) { next(err) }
}

async function putProducts(req, res, next) {
  try {
    const { data } = req.body
    if (!data || typeof data !== 'object') return res.status(400).json({ error: '无效的数据格式' })

    const { title, subtitle, categories } = data

    // Upsert page metadata
    await pool.query(
      "INSERT INTO content (key, data) VALUES ('products', $1) ON CONFLICT (key) DO UPDATE SET data = $1",
      [JSON.stringify({ title, subtitle })]
    )

    if (Array.isArray(categories)) {
      const existingCats = await pool.query('SELECT id FROM product_categories')
      const existingCatIds = new Set(existingCats.rows.map(r => r.id))
      const keptCatIds = new Set()

      for (let ci = 0; ci < categories.length; ci++) {
        const cat = categories[ci]
        let catId

        const catResult = await pool.query(
          'INSERT INTO product_categories (name, slug, icon, \"desc\", detail_description, sort_order) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO UPDATE SET name=$1, icon=$3, \"desc\"=$4, detail_description=$5, sort_order=$6 RETURNING id',
          [cat.name, cat.slug, cat.icon, cat.desc, cat.detailDescription || cat.detail_description || '', ci]
        )
        catId = catResult.rows[0].id
        keptCatIds.add(catId)

        const existingSubs = await pool.query('SELECT id FROM product_subcategories WHERE category_id = $1', [catId])
        const existingSubIds = new Set(existingSubs.rows.map(r => r.id))
        const keptSubIds = new Set()

        for (let si = 0; si < (cat.subCategories || []).length; si++) {
          const sub = cat.subCategories[si]
          const subResult = await pool.query(
            'INSERT INTO product_subcategories (category_id, name, sort_order) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id',
            [catId, sub.name, si]
          )
          let subId = subResult.rows[0]?.id
          if (!subId) {
            const f = await pool.query('SELECT id FROM product_subcategories WHERE category_id=$1 AND name=$2', [catId, sub.name])
            subId = f.rows[0]?.id
          }
          if (!subId) continue
          keptSubIds.add(subId)

          const existingItems = await pool.query('SELECT id FROM product_items WHERE subcategory_id = $1', [subId])
          const existingItemIds = new Set(existingItems.rows.map(r => r.id))
          const keptItemIds = new Set()

          for (let pi = 0; pi < (sub.products || []).length; pi++) {
            const prod = sub.products[pi]
            const itemResult = await pool.query(
              'INSERT INTO product_items (subcategory_id, name, slug, tagline, \"desc\", image, url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING RETURNING id',
              [subId, prod.name, prod.slug || '', prod.tagline || '', prod.desc || '', prod.image || '', prod.url || '', pi]
            )
            let prodId = itemResult.rows[0]?.id
            if (!prodId) {
              const f = await pool.query('SELECT id FROM product_items WHERE subcategory_id=$1 AND slug=$2', [subId, prod.slug])
              prodId = f.rows[0]?.id
              if (prodId) {
                await pool.query(
                  'UPDATE product_items SET name=$1, tagline=$2, \"desc\"=$3, image=$4, url=$5, sort_order=$6 WHERE id=$7',
                  [prod.name, prod.tagline || '', prod.desc || '', prod.image || '', prod.url || '', pi, prodId]
                )
              }
            }
            if (!prodId) continue
            keptItemIds.add(prodId)

            // Sync features
            await pool.query('DELETE FROM product_features WHERE product_id = $1', [prodId])
            for (let fi = 0; fi < (prod.features || []).length; fi++) {
              const feat = prod.features[fi]
              await pool.query('INSERT INTO product_features (product_id, icon, text, sort_order) VALUES ($1,$2,$3,$4)', [prodId, feat.icon || 'CheckCircle2', feat.text, fi])
            }

            // Sync specs
            await pool.query('DELETE FROM product_specs WHERE product_id = $1', [prodId])
            for (let spi = 0; spi < (prod.specs || []).length; spi++) {
              const spec = prod.specs[spi]
              await pool.query('INSERT INTO product_specs (product_id, label, value, sort_order) VALUES ($1,$2,$3,$4)', [prodId, spec.label, spec.value, spi])
            }
          }

          // Delete removed items
          for (const id of existingItemIds) {
            if (!keptItemIds.has(id)) await pool.query('DELETE FROM product_items WHERE id = $1', [id])
          }
        }

        // Delete removed subcategories
        for (const id of existingSubIds) {
          if (!keptSubIds.has(id)) await pool.query('DELETE FROM product_subcategories WHERE id = $1', [id])
        }
      }

      // Delete removed categories
      for (const id of existingCatIds) {
        if (!keptCatIds.has(id)) await pool.query('DELETE FROM product_categories WHERE id = $1', [id])
      }
    }

    res.json({ key: 'products', success: true })
    if (process.env.DEPLOY_HOOK_URL) fetch(process.env.DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {})
  } catch (err) { next(err) }
}

// GET /api/visitor/count — increment and return site visit count
router.get('/visitor/count', async (req, res) => {
  try {
    const r = await pool.query("SELECT data FROM content WHERE key = 'site'")
    const data = r.rows[0].data
    data.visitCount = (data.visitCount || 0) + 1
    await pool.query('UPDATE content SET data = $1 WHERE key = $2', [JSON.stringify(data), 'site'])
    res.json({ count: data.visitCount })
  } catch (err) { next(err) }
})

export default router
