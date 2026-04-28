import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { Pool } = pg

const KEYS = [
  'site', 'home', 'about', 'culture', 'industry', 'innovation',
  'products', 'green', 'news', 'partners', 'contact',
]

async function fetchContent() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, skipping content fetch. Using defaults.')
    return
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    console.log('Fetching content from database...')
    const content = {}

    for (const key of KEYS) {
      try {
        const result = await pool.query('SELECT data FROM content WHERE key = $1', [key])
        if (result.rows.length > 0) {
          content[key] = result.rows[0].data
          console.log(`  ✓ ${key}`)
        } else {
          console.log(`  - ${key} (not found, using defaults)`)
        }
      } catch (err) {
        console.error(`  ✗ ${key}:`, err.message)
      }
    }

    content._generatedAt = new Date().toISOString()

    const outputPath = path.resolve(__dirname, '..', 'public', 'content.json')
    fs.writeFileSync(outputPath, JSON.stringify(content))
    console.log(`Content written to ${outputPath} (${Object.keys(content).length} keys, generated at ${content._generatedAt})`)
  } finally {
    await pool.end()
  }
}

fetchContent().catch((err) => {
  console.error('Failed to fetch content:', err)
  process.exitCode = 1
})
