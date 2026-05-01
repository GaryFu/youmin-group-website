import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import auth from '../middleware/auth.js'

const router = Router()

function getSupabase() {
  const url = process.env.SUPABASE_URL || `https://${(process.env.DATABASE_URL || '').match(/@db\.(.+?)\.supabase/)?.[1]}.supabase.co`
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
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
    const buffer = Buffer.from(base64Data, 'base64')
    const filePath = `products/${Date.now()}-${filename}`

    const supabase = getSupabase()
    if (!supabase) {
      // Fallback: store base64 as data URL directly
      return res.json({ url: image })
    }

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, buffer, {
        contentType: `image/${ext}`,
        upsert: false,
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
