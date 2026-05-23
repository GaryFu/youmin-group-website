import pool from './pool.js'

let ready = false

export async function ensureNewsImagesColumn() {
  if (ready) return

  await pool.query(`ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb`)
  await pool.query(`
    UPDATE news_articles
    SET images = jsonb_build_array(cover)
    WHERE jsonb_array_length(images) = 0
      AND cover IS NOT NULL
      AND cover <> ''
  `)
  ready = true
}

export function normalizeNewsImages({ images, cover }) {
  const source = Array.isArray(images) ? images : (cover ? [cover] : [])
  return source
    .map((image, index) => {
      if (typeof image === 'string') {
        const url = image.trim()
        return url ? { url, afterParagraph: index === 0 ? null : index } : null
      }

      const url = String(image?.url || '').trim()
      if (!url) return null

      const afterParagraph = Number.parseInt(image.afterParagraph, 10)
      return {
        url,
        afterParagraph: index === 0 || !Number.isFinite(afterParagraph) || afterParagraph < 1 ? null : afterParagraph,
      }
    })
    .filter(Boolean)
}
