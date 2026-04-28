import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
})

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err)
})

export default pool
