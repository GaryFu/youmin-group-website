import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { Pool } = pg

const JSONB_KEYS = ['site', 'home', 'about', 'culture', 'industry', 'innovation', 'green', 'partners', 'contact']

async function fetchContent() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, skipping content fetch. Using defaults.')
    return
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 })

  try {
    console.log('Fetching content from database...')
    const content = {}

    // JSONB content
    for (const key of JSONB_KEYS) {
      try {
        const result = await pool.query('SELECT data FROM content WHERE key = $1', [key])
        if (result.rows.length > 0) {
          content[key] = result.rows[0].data
          console.log(`  ✓ ${key}`)
        } else {
          console.log(`  - ${key} (not found)`)
        }
      } catch (err) {
        console.error(`  ✗ ${key}:`, err.message)
      }
    }

    // News: relational
    try {
      const newsMeta = await pool.query("SELECT data FROM content WHERE key = 'news'")
      const pageData = newsMeta.rows[0]?.data || { title: '新闻动态', subtitle: 'NEWS & UPDATES' }
      const articlesResult = await pool.query('SELECT title, digest, url, cover, category, date FROM news_articles ORDER BY date DESC, sort_order ASC')
      content.news = { ...pageData, articles: articlesResult.rows }
      console.log(`  ✓ news (${articlesResult.rows.length} articles)`)
    } catch (err) {
      console.error('  ✗ news:', err.message)
    }

    // Products: relational
    try {
      const prodMeta = await pool.query("SELECT data FROM content WHERE key = 'products'")
      const pageData = prodMeta.rows[0]?.data || { title: '产品与服务', subtitle: 'PRODUCTS & SERVICES' }
      const { title, subtitle } = pageData

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
              name: item.name, slug: item.slug, tagline: item.tagline,
              desc: item.desc, image: item.image, url: item.url,
              features: features.rows, specs: specs.rows,
            })
          }
          subCategories.push({ name: sub.name, products })
        }

        categories.push({
          name: cat.name, slug: cat.slug, icon: cat.icon, desc: cat.desc,
          detailDescription: cat.detail_description, items: [],
          subCategories, relatedArticles: pageData.categories?.find(c => c.slug === cat.slug)?.relatedArticles || [],
        })
      }

      content.products = { title, subtitle, categories }
      console.log(`  ✓ products (${categories.reduce((s, c) => s + c.subCategories.reduce((s2, sc) => s2 + sc.products.length, 0), 0)} products)`)
    } catch (err) {
      console.error('  ✗ products:', err.message)
    }

    content._generatedAt = new Date().toISOString()
    const outputPath = path.resolve(__dirname, '..', 'public', 'content.json')
    fs.writeFileSync(outputPath, JSON.stringify(content))
    console.log(`Content written to ${outputPath} (${Object.keys(content).length} keys)`)
  } finally {
    await pool.end()
  }
}

fetchContent().catch((err) => {
  console.error('Failed to fetch content:', err)
  process.exitCode = 1
})
