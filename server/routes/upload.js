import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import auth from '../middleware/auth.js'

const router = Router()

const MAX_SIZE = 1920
const WEBP_QUALITY = 82

function getSupabase() {
  const url = process.env.SUPABASE_URL || `https://${(process.env.DATABASE_URL || '').match(/@db\.(.+?)\.supabase/)?.[1]}.supabase.co`
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function safeFilename(original) {
  // Keep only ASCII alphanumeric, dots, dashes, underscores; replace rest
  const ext = (original || 'image.jpg').split('.').pop().replace(/[^a-z0-9]/gi, '') || 'jpg'
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
}

router.post('/image', auth, async (req, res, next) => {
  try {
    const { image, filename } = req.body

    if (!image || !filename) {
      return res.status(400).json({ error: '请提供图片数据和文件名' })
    }

    // Extract base64 data
    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) {
      return res.status(400).json({ error: '无效的图片格式，需要 base64 data URL' })
    }

    const [, ext, base64Data] = matches
    let buffer = Buffer.from(base64Data, 'base64')

    // Process image: resize + convert to WebP
    try {
      buffer = await sharp(buffer)
        .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()
      console.log(`Image processed: ${(buffer.length / 1024).toFixed(1)}KB`)
    } catch (sharpErr) {
      // If sharp fails (e.g., corrupt image), upload original
      console.warn('Sharp processing skipped:', sharpErr.message)
    }

    const cleanName = safeFilename(filename).replace(/\.[^.]+$/, '.webp')
    const filePath = `products/${cleanName}`

    const supabase = getSupabase()
    if (!supabase) {
      return res.json({ url: image })
    }

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, buffer, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (error) throw error

    const { data: publicUrl } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    res.json({ url: publicUrl.publicUrl })
  } catch (err) {
    next(err)
  }
})

export default router
