import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import pool from '../server/db/pool.js'

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const publicDir = path.join(projectRoot, 'public')
const imageDir = path.join(publicDir, 'images', 'products', 'wechat')
const generatedLabelPrefixes = [
  '视觉识别',
  '表格识别',
  '产品成分分析保证值',
  '营养指标',
  '推荐配方',
]

const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
const model = process.env.OLLAMA_OCR_MODEL || 'deepseek-ocr:latest'

function normalizePublicPath(value) {
  if (!value) return ''
  if (value.startsWith('/')) return value
  try {
    return new URL(value).pathname
  } catch {
    return value
  }
}

function localPathFromPublicPath(value) {
  const publicPath = normalizePublicPath(value)
  if (!publicPath.startsWith('/images/products/wechat/')) return null
  return path.join(publicDir, publicPath)
}

function isGeneratedSpec(label) {
  return generatedLabelPrefixes.some((prefix) => label.startsWith(prefix))
}

function isLikelyLowValueSmallImage(metadata, size) {
  const ratio = metadata.width / metadata.height
  return metadata.width < 260 || metadata.height < 240 || size < 5000 || (ratio > 3.2 && metadata.height < 260)
}

function shouldAskVision(metadata, size) {
  const ratio = metadata.width / metadata.height
  return isLikelyLowValueSmallImage(metadata, size) || ratio > 1.15 || metadata.height <= 1150
}

function cleanOcrLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^[-|:：\s]+$/.test(line))
    .filter((line) => !/^(?:(?:返回文本|请在此处输入文本|请确保文本正确无误)[。.\s]*)+$/.test(line))
    .filter((line) => !['佑民股份', 'YOMAN佑民'].includes(line))
}

function isWatermarkText(text) {
  const normalized = String(text || '').trim()
  return /^(?:微信|公众号|YOMAN佑民|股份)$/.test(normalized) || /^[^；,，、\s]{0,4}民股份$/.test(normalized)
}

function numericLikeCount(lines) {
  return lines.filter((line) => /(?:[<>≤≥=]|[0-9])/.test(line)).length
}

function looksLikeTableText(lines) {
  const text = lines.join(' ')
  const tableKeywords = [
    '产品名称',
    '水分',
    '粗蛋白',
    '粗脂肪',
    '粗纤维',
    '粗灰分',
    '赖氨酸',
    '钙',
    '磷',
    '氯化钠',
    '维生素',
    '蛋氨酸',
    '苏氨酸',
    '保证值',
    '营养',
    '推荐配方',
  ]
  return lines.length >= 4 && numericLikeCount(lines) >= 2 && tableKeywords.some((keyword) => text.includes(keyword))
}

function lineLooksLikeValue(line) {
  return /^(?:[A-Z]{1,6}\d{1,4}(?:\.\d+)?|[<>≤≥=]?\s*\d|[\d.]+[-~至][\d.]+)/.test(line)
}

function isNumericValue(value) {
  return /^(?:[<>≤≥=]?\s*\d|[\d.]+[-~至][\d.]+)/.test(String(value || '').trim())
}

function isSectionHeading(label) {
  return /保证值[:：]?$/.test(String(label || '').trim())
}

function parseOcrSpecs(lines, productName = '') {
  if (!looksLikeTableText(lines)) return []

  const firstValueIndex = lines.findIndex(lineLooksLikeValue)
  if (firstValueIndex > 0) {
    const labels = lines.slice(0, firstValueIndex).filter((label) => !isSectionHeading(label))
    const values = lines.slice(firstValueIndex, firstValueIndex + labels.length)
    const simpleSingleRowTable = labels.length <= 12 && lines.length <= labels.length * 2 + 3
    if (simpleSingleRowTable && labels.length >= 2 && values.length >= 2 && numericLikeCount(values) >= 2) {
      const normalizedValues = [...values]
      if (/产品名称/.test(labels[0]) && isNumericValue(normalizedValues[0]) && productName) {
        normalizedValues.unshift(productName)
      }
      return labels
        .map((label, index) => ({ label, value: normalizedValues[index] || '' }))
        .filter((spec) => spec.label && spec.value && !isWatermarkText(spec.label) && !isWatermarkText(spec.value))
    }
  }

  const keyValueSpecs = lines
    .map((line) => {
      const match = line.match(/^([^:：]{2,24})[:：]\s*(.+)$/)
      return match ? { label: match[1].trim(), value: match[2].trim() } : null
    })
    .filter(Boolean)

  if (keyValueSpecs.length > 0) return keyValueSpecs
  const title = lines.find((line) => /营养|推荐配方|保证值|产品名称/.test(line)) || '图片表格'
  return [{ label: title, value: lines.filter((line) => !isWatermarkText(line)).join('；') }]
}

async function prepareImageForOcr(imagePath, metadata) {
  const ratio = metadata.width / metadata.height
  const watermarkMask = Buffer.from(
    `<svg width="${metadata.width}" height="${metadata.height}">
      <rect x="${Math.round(metadata.width * 0.66)}" y="${Math.round(metadata.height * 0.58)}" width="${Math.round(metadata.width * 0.34)}" height="${Math.round(metadata.height * 0.42)}" fill="#fff"/>
    </svg>`
  )
  let pipeline = sharp(imagePath)
    .flatten({ background: '#ffffff' })
    .composite([{ input: watermarkMask, left: 0, top: 0 }])

  if (metadata.height < 280 || ratio > 2.2) {
    pipeline = pipeline
      .resize({ width: Math.min(Math.max(metadata.width * 2, 1200), 2200), kernel: 'nearest' })
      .extend({ top: 80, bottom: 80, left: 40, right: 40, background: '#ffffff' })
  } else if (metadata.width < 900) {
    pipeline = pipeline.resize({ width: 1200, withoutEnlargement: false })
  }

  return pipeline.png().toBuffer()
}

async function callVisionModel({ product, imagePath, metadata }) {
  const image = await prepareImageForOcr(imagePath, metadata)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Number(process.env.OLLAMA_OCR_TIMEOUT_MS || 120000))

  let body
  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      signal: controller.signal,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: '请识别这张图片中的文字和表格内容。只返回文本。',
        images: [image.toString('base64')],
        stream: false,
        options: {
          temperature: 0,
          num_predict: 1024,
        },
      }),
    })

    body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || `Ollama OCR 请求失败 (${response.status})`)
  } finally {
    clearTimeout(timeout)
  }

  const lines = cleanOcrLines(body.response || '')
  const specs = parseOcrSpecs(lines, product.name)
  return {
    isTable: specs.length > 0,
    keepImage: specs.length > 0,
    specs,
  }
}
async function analyzeProductImages(product) {
  const images = (product.images || []).map(normalizePublicPath).filter(Boolean)
  const keptImages = []
  const visualSpecs = []

  for (const image of images) {
    const filePath = localPathFromPublicPath(image)
    if (!filePath || !fs.existsSync(filePath)) {
      keptImages.push(image)
      continue
    }

    const [metadata, stat] = await Promise.all([sharp(filePath).metadata(), fs.promises.stat(filePath)])
    const lowValueSmall = isLikelyLowValueSmallImage(metadata, stat.size)

    if (!shouldAskVision(metadata, stat.size)) {
      keptImages.push(image)
      continue
    }

    const result = await callVisionModel({ product, imagePath: filePath, metadata })
    if (!lowValueSmall || result.keepImage || result.isTable) keptImages.push(image)

    if (result.isTable && result.specs.length > 0) {
      for (const spec of result.specs) {
        visualSpecs.push({
          label: `视觉识别-${spec.label}`.slice(0, 80),
          value: spec.value.slice(0, 1200),
        })
      }
    }
  }

  return { keptImages: [...new Set(keptImages)], visualSpecs }
}

async function updateProduct(product, keptImages, visualSpecs) {
  const existingSpecs = await pool.query(
    'SELECT label, value FROM product_specs WHERE product_id = $1 ORDER BY sort_order',
    [product.id]
  )
  const specs = existingSpecs.rows.filter((spec) => !isGeneratedSpec(spec.label))

  for (const visualSpec of visualSpecs) {
    if (!specs.some((spec) => spec.label === visualSpec.label && spec.value === visualSpec.value)) {
      specs.push(visualSpec)
    }
  }

  await pool.query('UPDATE product_items SET image=$1, images=$2 WHERE id=$3', [
    keptImages[0] || null,
    JSON.stringify(keptImages),
    product.id,
  ])

  await pool.query('DELETE FROM product_specs WHERE product_id = $1', [product.id])
  for (let index = 0; index < specs.length; index += 1) {
    await pool.query('INSERT INTO product_specs (product_id, label, value, sort_order) VALUES ($1,$2,$3,$4)', [
      product.id,
      specs[index].label,
      specs[index].value,
      index,
    ])
  }
}

async function clearGeneratedSpecsOnly() {
  const result = await pool.query(
    `DELETE FROM product_specs
     WHERE ${generatedLabelPrefixes.map((_, index) => `label LIKE $${index + 1}`).join(' OR ')}
     RETURNING id`,
    generatedLabelPrefixes.map((prefix) => `${prefix}%`)
  )
  return result.rowCount
}

async function removeUnreferencedLocalImages() {
  const result = await pool.query('SELECT images FROM product_items')
  const referenced = new Set()
  for (const row of result.rows) {
    for (const image of row.images || []) referenced.add(path.basename(normalizePublicPath(image)))
  }

  if (!fs.existsSync(imageDir)) return 0
  let removed = 0
  for (const file of await fs.promises.readdir(imageDir)) {
    if (!referenced.has(file)) {
      await fs.promises.rm(path.join(imageDir, file), { force: true })
      removed += 1
    }
  }
  return removed
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const clearOnly = process.argv.includes('--clear-only')
  const productArg = process.argv.find((arg) => arg.startsWith('--product='))
  const productId = productArg ? Number(productArg.split('=')[1]) : null

  if (clearOnly) {
    const deleted = dryRun ? 0 : await clearGeneratedSpecsOnly()
    console.log(`${dryRun ? 'Would clear' : 'Cleared'} ${deleted} generated specs.`)
    return
  }

  const result = productId
    ? await pool.query('SELECT id, name, image, images FROM product_items WHERE id = $1 ORDER BY id', [productId])
    : await pool.query('SELECT id, name, image, images FROM product_items ORDER BY id')

  for (const product of result.rows) {
    const { keptImages, visualSpecs } = await analyzeProductImages(product)
    console.log(
      `${dryRun ? 'would update' : 'updated'} ${product.id} ${product.name}: ${product.images?.length || 0} -> ${keptImages.length} images, ${visualSpecs.length} visual specs`
    )
    if (!dryRun) await updateProduct(product, keptImages, visualSpecs)
  }

  if (!dryRun) {
    const removed = await removeUnreferencedLocalImages()
    console.log(`Removed ${removed} unreferenced local images.`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
