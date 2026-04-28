import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import contentRoutes from './routes/content.js'
import { errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/content', contentRoutes)

if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const distPath = path.resolve(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use(errorHandler)

// Only listen when not on Vercel (Vercel uses serverless export)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app
