import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import pool from './pool.js'
import { hashPassword } from '../utils/hash.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function seed() {
  console.log('Seeding database...')

  // Run schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('Schema applied.')

  // Seed admin user
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@youmin.local'
  const adminPassword = process.env.ADMIN_PASSWORD || 'youmin2026'
  const passwordHash = await hashPassword(adminPassword)

  await pool.query(
    `INSERT INTO admin_users (username, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET username = $1`,
    [adminUsername, adminEmail, passwordHash]
  )
  console.log(`Admin user seeded: ${adminUsername} / ${adminEmail}`)

  // Seed content defaults
  const contentPath = path.resolve(__dirname, '..', '..', 'src', 'data', 'content.js')
  const contentModule = await import(contentPath)

  let defaults
  // The module might export individually or as a default object
  if (contentModule.default) {
    defaults = contentModule.default
  } else {
    // Aggregate named exports
    const keys = [
      'site', 'homeContent', 'aboutContent', 'industryContent',
      'innovationContent', 'productsContent', 'greenContent',
      'newsContent', 'partnersContent', 'contactContent',
    ]
    defaults = {}
    for (const key of keys) {
      if (contentModule[key]) {
        // Strip "Content" suffix to match content keys: homeContent -> home
        const contentKey = key.replace('Content', '')
        defaults[contentKey] = contentModule[key]
      }
    }
  }

  const entries = Object.entries(defaults).filter(([, v]) => v && typeof v === 'object')

  for (const [key, data] of entries) {
    // For news and products, only seed metadata (data lives in relational tables)
    const seedData = (key === 'news' || key === 'products')
      ? { title: data.title, subtitle: data.subtitle }
      : data

    await pool.query(
      `INSERT INTO content (key, data) VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(seedData)]
    )
    console.log(`Content seeded: ${key}`)
  }

  console.log('Seed complete.')
  await pool.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
