import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pool from '../server/db/pool.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const localImageDir = path.join(projectRoot, 'public', 'images', 'products', 'wechat')
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'

const GENERIC_LINES = new Set([
  '√',
  '★',
  '做好人，造好料',
  '做好人 造好料',
  '有好料，料更好',
  '各尽所能 齐创共享',
  '以客户为中心',
  '以质量为生命',
  '扫码关注我们',
  '搜索关注',
  '@佑民股份 公众号',
  '@佑民股份 视频号',
  '@佑民股份 抖音号',
  '关注我们',
  'FOLLOW US',
  'END',
])

function decodeEntities(value = '') {
  return value
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(x?)([0-9a-fA-F]+);/g, (_, isHex, code) =>
      String.fromCodePoint(parseInt(code, isHex ? 16 : 10))
    )
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function getMeta(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return decodeEntities(match[1]).trim()
  }
  return ''
}

function getWechatContentHtml(html) {
  const marker = html.indexOf('id="js_content"')
  if (marker < 0) return ''

  const divStart = html.lastIndexOf('<div', marker)
  const tagPattern = /<\/?div\b[^>]*>/gi
  tagPattern.lastIndex = divStart

  let depth = 0
  let match
  while ((match = tagPattern.exec(html))) {
    if (match[0][1] === '/') depth -= 1
    else depth += 1
    if (depth === 0) return html.slice(divStart, match.index + match[0].length)
  }

  return html.slice(divStart)
}

function stripHtml(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<\/(p|section|div|h\d|span|li)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/[ \t\r\f\v]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeLines(text) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^NO\.\d+$/i.test(line))
    .filter((line) => !/^[()（）·.\-]+$/.test(line))
    .filter((line) => !GENERIC_LINES.has(line))
    .map((line) => line.replace(/\s+([，。；：、])/g, '$1').replace(/([（(])\s+/g, '$1'))
}

function indexOfMarker(lines, markers, start = 0) {
  return lines.findIndex((line, index) => index >= start && markers.some((marker) => line.includes(marker)))
}

function collectAfter(lines, startMarkers, stopMarkers, maxLines = 12) {
  const markerIndex = indexOfMarker(lines, startMarkers)
  if (markerIndex < 0) return []

  const output = []
  const markerLine = lines[markerIndex]
  const inline = markerLine.split(/[：:]/).slice(1).join(':').trim()
  if (inline) output.push(inline)

  for (let index = markerIndex + 1; index < lines.length && output.length < maxLines; index += 1) {
    const line = lines[index]
    if (stopMarkers.some((marker) => line.includes(marker))) break
    if (line === '。' || line === '、') continue
    output.push(line)
  }

  return joinFragments(output)
}

function joinFragments(lines) {
  const joined = []
  for (const line of lines) {
    const previous = joined[joined.length - 1]
    if (
      previous &&
      (previous.endsWith('/') ||
        /^[︰:：,，.。；;%）)]$/.test(line) ||
        /^\d+$/.test(previous) ||
        /^[︰:：]/.test(line))
    ) {
      joined[joined.length - 1] = `${previous}${line}`.replace(/\s+/g, '')
    } else {
      joined.push(line)
    }
  }
  return joined
}

function firstParagraph(lines, productName) {
  const skipMarkers = [
    '产品介绍',
    '产品设计及饲养目标',
    '产品营养分析保证值',
    '产品主要原料组成',
    '饲喂阶段',
    '饲喂方案',
    '产品照片',
    '标签照片',
    '推荐配方',
    '营养指标',
  ]
  return lines.find((line) => {
    if (line === productName) return false
    if (skipMarkers.some((marker) => line.includes(marker))) return false
    if (line.length < 20) return false
    return /[。；，,]/.test(line)
  })
}

function makeTagline(title, productName, currentTagline) {
  const current = currentTagline?.trim() || ''
  const generic = !current || /做好人|造好料|佑民明星产品之/.test(current)
  if (!generic && current.length > 8) return current
  if (generic && title === productName) return productName

  let tagline = title
    .replace(productName, '')
    .replace(/[—\-–_]+$/g, '')
    .replace(/^佑民明星产品之[—\-]*[——]*/g, '佑民明星产品')
    .replace(/系列之$/g, '系列')
    .replace(/[———\-–_]+/g, ' ')
    .trim()

  if (!tagline || tagline.length < 3) tagline = current || title || productName
  return tagline
}

function extractFeatureLines(lines) {
  const rawLines = collectAfter(lines, ['产品特点'], ['推荐配方', '饲养关键点', '产品成分', '产品感官'], 12)
  const features = []

  for (const rawLine of rawLines) {
    const startsNew = /^●/.test(rawLine) || /^\d+[、.]/.test(rawLine)
    const clean = rawLine.replace(/^(?:●|\d+[、.])\s*/, '').trim()
    if (clean.length <= 1) continue

    const previous = features[features.length - 1]
    if (!previous || startsNew || clean.includes('：')) {
      features.push(clean)
    } else {
      features[features.length - 1] = `${previous}${clean}`
    }
  }

  return features.filter((line) => line.length > 8)
}

function makeFeatures({ intro, stage, rawMaterials, featureLines, title }) {
  const features = []
  const add = (icon, text) => {
    const clean = text.replace(/[。；;]+$/g, '').trim()
    if (clean && !features.some((feature) => feature.text === clean)) features.push({ icon, text: clean })
  }

  for (const line of featureLines) add('Star', line)

  if (features.length === 0) {
    const clauses = intro
      .split(/[。；;]/)
      .map((clause) => clause.trim())
      .filter((clause) => clause.length >= 8)

    for (const clause of clauses) {
      if (/促进|提高|增强|降低|减少|解决|采食|消化|免疫|泌乳|腹泻|长势|成活/.test(clause)) {
        add(features.length % 2 === 0 ? 'TrendingUp' : 'Shield', clause)
      }
    }
  }

  if (rawMaterials) add('Package', '精选原料，配方营养均衡')
  if (stage) add('CheckCircle2', `适用于${stage.replace(/[。；;]+$/g, '')}`)
  if (features.length === 0 && title) add('Award', title)

  return features.slice(0, 5)
}

function buildDescription({ productName, title, lines, introLines, rawMaterials, usageLines, featureLines, currentDesc }) {
  const paragraphs = []
  const intro = introLines.join('')
  if (intro.length > 20) paragraphs.push(intro)
  if (paragraphs.length === 0 && featureLines.length > 0) paragraphs.push(featureLines.join('；') + '。')
  if (usageLines.length > 0) paragraphs.push(usageLines.join(''))
  if (rawMaterials && rawMaterials.length < 260) paragraphs.push(`主要原料包括${rawMaterials.replace(/[。；;]+$/g, '')}。`)

  const desc = paragraphs
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (desc.length >= 30) return desc
  if (lines.includes('金奶霸') && lines.includes('金仔多') && lines.some((line) => line.includes('母猪健康的守护神'))) {
    return `${productName}由金奶霸、金仔多组合呈现，围绕母猪健康管理与母仔无忧饲喂场景设计。`
  }
  if (lines.includes('营养指标') && lines.includes('推荐配方')) {
    return `${productName}原文包含营养指标、推荐配方等产品信息，正文主要以图片形式呈现。`
  }
  if (title && title !== productName) return `${productName}来源于公众号文章「${title}」，原文主要以产品图片形式呈现。`
  return currentDesc || desc
}

function parseArticle(product, html) {
  const title = getMeta(html, 'og:title') || product.name
  const ogDescription = getMeta(html, 'og:description')
  const ogImage = getMeta(html, 'og:image')
  const contentHtml = getWechatContentHtml(html)
  const text = stripHtml(contentHtml)
  const lines = normalizeLines(text)
  const bodyImages = [...contentHtml.matchAll(/(?:data-src|src)="([^"]+)"/g)]
    .map((match) => decodeEntities(match[1]).trim())
    .filter((src) => /^https?:\/\/mmbiz\.qpic\.cn\//.test(src))
  const images = [...new Set([ogImage, ...bodyImages].filter(Boolean))].slice(0, 8)

  const featureLines = extractFeatureLines(lines)
  const introLines = collectAfter(
    lines,
    ['产品介绍', '产品设计及饲养目标', '★产品介绍'],
    ['产品营养分析保证值', '产品主要原料组成', '饲喂阶段', '产品用途', '使用方法', '产品特点'],
    8
  )
  if (introLines.length === 0 && featureLines.length === 0) {
    const paragraph = firstParagraph(lines, product.name)
    if (paragraph) introLines.push(paragraph)
  }

  const rawMaterials = collectAfter(
    lines,
    ['产品主要原料组成', '★产品主要原料组成', 'NO.3 产品主要原料组成'],
    ['饲喂阶段', '饲喂方案', '产品用途', '使用方法', '产品照片', '标签照片', '推荐配方'],
    8
  ).join('')

  const stageLines = collectAfter(
    lines,
    ['饲喂阶段'],
    ['产品用途', '使用方法', '产品特点', '饲喂方案', '产品照片', '标签照片', '推荐配方', '产品成分'],
    4
  )
  const stage = stageLines.join('').replace(/^.*饲喂阶段[：:]/, '').replace(/\s+/g, '').trim()

  const usageLines = collectAfter(
    lines,
    ['产品用途及使用方法', '产品用途', '使用方法'],
    ['产品照片', '标签照片', '扫码', '河南佑民', '推荐配方'],
    10
  )

  const intro = introLines.join('')
  const tagline = makeTagline(title, product.name, product.tagline)
  const desc = buildDescription({
    productName: product.name,
    title,
    lines,
    introLines,
    rawMaterials,
    usageLines,
    featureLines,
    currentDesc: product.desc || ogDescription,
  })
  const features = makeFeatures({ intro, stage, rawMaterials, featureLines, title })
  const specs = [
    { label: '产品系列', value: tagline },
    stage ? { label: '饲喂阶段', value: stage.replace(/[。；;]+$/g, '') } : null,
    rawMaterials ? { label: '主要原料', value: rawMaterials.replace(/[。；;]+$/g, '') } : null,
    title ? { label: '文章来源', value: title } : null,
  ].filter(Boolean)

  return { title, tagline, desc, images, features, specs, textLength: text.length }
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Referer: 'https://mp.weixin.qq.com/',
      'User-Agent': USER_AGENT,
    },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}

async function downloadImage(url, productId, index) {
  const outputName = `${productId}-${String(index + 1).padStart(2, '0')}.webp`
  const outputPath = path.join(localImageDir, outputName)
  const publicPath = `/images/products/wechat/${outputName}`

  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) return publicPath

  const response = await fetch(url, {
    headers: {
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      Referer: 'https://mp.weixin.qq.com/',
      'User-Agent': USER_AGENT,
    },
  })
  if (!response.ok) throw new Error(`image HTTP ${response.status}`)

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.startsWith('image/')) throw new Error(`unexpected image content-type: ${contentType}`)

  const input = Buffer.from(await response.arrayBuffer())
  if (input.length < 512) throw new Error('image response too small')

  await fs.promises.mkdir(localImageDir, { recursive: true })
  await sharp(input, { animated: false }).webp({ quality: 86 }).toFile(outputPath)
  return publicPath
}

async function localizeImages(images, productId) {
  const localized = []
  for (let index = 0; index < images.length; index += 1) {
    try {
      localized.push(await downloadImage(images[index], productId, index))
    } catch (error) {
      console.warn(`  image ${index + 1} skipped: ${error.message}`)
    }
  }
  return localized
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const result = await pool.query(
    `SELECT pi.id, pi.name, pi.slug, pi.tagline, pi."desc", pi.image, pi.images, pi.url
     FROM product_items pi
     WHERE pi.url LIKE '%mp.weixin.qq.com%'
     ORDER BY pi.id`
  )

  const products = result.rows
  const updates = []
  for (const product of products) {
    try {
      const html = await fetchHtml(product.url)
      const parsed = parseArticle(product, html)
      if (parsed.textLength === 0 && parsed.images.length === 0) {
        console.warn(`- ${product.id} ${product.name}: skipped, no article body or images parsed`)
        continue
      }
      if (!dryRun) {
        const localImages = await localizeImages(parsed.images, product.id)
        if (localImages.length > 0) parsed.images = localImages
      }
      updates.push({ id: product.id, name: product.name, ...parsed })
      console.log(`✓ ${product.id} ${product.name} (${parsed.textLength} chars)`)

      if (dryRun) continue

      await pool.query(
        `UPDATE product_items
         SET tagline = $1, "desc" = $2, image = $3, images = $4
         WHERE id = $5`,
        [
          parsed.tagline,
          parsed.desc,
          parsed.images[0] || product.image || null,
          JSON.stringify(parsed.images.length ? parsed.images : product.images || []),
          product.id,
        ]
      )

      await pool.query('DELETE FROM product_features WHERE product_id = $1', [product.id])
      for (let index = 0; index < parsed.features.length; index += 1) {
        await pool.query(
          'INSERT INTO product_features (product_id, icon, text, sort_order) VALUES ($1,$2,$3,$4)',
          [product.id, parsed.features[index].icon, parsed.features[index].text, index]
        )
      }

      await pool.query('DELETE FROM product_specs WHERE product_id = $1', [product.id])
      for (let index = 0; index < parsed.specs.length; index += 1) {
        await pool.query(
          'INSERT INTO product_specs (product_id, label, value, sort_order) VALUES ($1,$2,$3,$4)',
          [product.id, parsed.specs[index].label, parsed.specs[index].value, index]
        )
      }
    } catch (error) {
      console.warn(`✗ ${product.id} ${product.name}: ${error.message}`)
    }
  }

  const backupPath = path.join(os.tmpdir(), `tianyou-product-wechat-enrichment-${Date.now()}.json`)
  fs.writeFileSync(backupPath, JSON.stringify(updates, null, 2))
  console.log(`Wrote enrichment backup: ${backupPath}`)

  if (!dryRun) {
    console.log('Database updated. Run `npm run build` or `node --env-file=.env scripts/fetch-content.js` to refresh content.json.')
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
