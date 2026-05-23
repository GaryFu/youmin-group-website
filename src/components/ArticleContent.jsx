function renderInline(text) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function parseBlocks(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) { i++; continue }

    if (/^-{3,}$/.test(line)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/)
    if (heading) {
      blocks.push({ type: heading[1].length === 2 ? 'h2' : 'h3', text: heading[2] })
      i++
      continue
    }

    if (line.startsWith('>')) {
      const items = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        items.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      blocks.push({ type: 'quote', text: items.join('\n') })
      continue
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line)
      const items = []
      while (i < lines.length) {
        const itemLine = lines[i].trim()
        if (ordered && /^\d+\.\s+/.test(itemLine)) items.push(itemLine.replace(/^\d+\.\s+/, ''))
        else if (!ordered && /^[-*]\s+/.test(itemLine)) items.push(itemLine.replace(/^[-*]\s+/, ''))
        else break
        i++
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items })
      continue
    }

    const paragraph = [line]
    i++
    while (i < lines.length) {
      const next = lines[i].trim()
      if (!next || /^#{2,3}\s+/.test(next) || /^[-*]\s+/.test(next) || /^\d+\.\s+/.test(next) || /^-{3,}$/.test(next) || next.startsWith('>')) break
      paragraph.push(next)
      i++
    }
    blocks.push({ type: 'p', text: paragraph.join(' ') })
  }

  return blocks
}

function normalizeInlineImages(images) {
  return (images || [])
    .map((image, index) => (typeof image === 'string' ? { url: image, afterParagraph: index + 1 } : image))
    .filter((image) => image?.url)
}

export default function ArticleContent({ content, inlineImages = [], emptyText = '暂无详细内容' }) {
  const blocks = parseBlocks(content)
  const images = normalizeInlineImages(inlineImages)
  let paragraphNumber = 0
  const usedImages = new Set()

  const renderImages = (items, keyPrefix) => (
    <div className="my-8 space-y-5">
      {items.map((image, index) => (
        <img key={`${keyPrefix}-${index}`} src={image.url} alt="" className="w-full rounded-xl object-contain bg-gray-50 shadow-md" />
      ))}
    </div>
  )

  if (blocks.length === 0) {
    return images.length > 0 ? renderImages(images, 'empty') : <p className="py-8 text-center text-gray-400">{emptyText}</p>
  }

  const rendered = blocks.map((block, index) => {
    if (block.type === 'p') paragraphNumber++
    const paragraphImages = block.type === 'p'
      ? images.filter((image, imageIndex) => {
        const matched = Number(image.afterParagraph) === paragraphNumber
        if (matched) usedImages.add(imageIndex)
        return matched
      })
      : []

    let node
    if (block.type === 'h2') node = <h2 className="mb-4 mt-9 text-2xl font-bold leading-snug text-gray-900">{renderInline(block.text)}</h2>
    else if (block.type === 'h3') node = <h3 className="mb-3 mt-7 text-xl font-bold leading-snug text-gray-900">{renderInline(block.text)}</h3>
    else if (block.type === 'quote') node = <blockquote className="my-6 border-l-4 border-green-500 bg-green-50 px-5 py-4 text-base leading-8 text-green-900">{renderInline(block.text)}</blockquote>
    else if (block.type === 'hr') node = <hr className="my-9 border-gray-200" />
    else if (block.type === 'ul') node = <ul className="mb-6 list-disc space-y-2 pl-6 text-base leading-8 text-gray-700">{block.items.map((item, i) => <li key={i}>{renderInline(item)}</li>)}</ul>
    else if (block.type === 'ol') node = <ol className="mb-6 list-decimal space-y-2 pl-6 text-base leading-8 text-gray-700">{block.items.map((item, i) => <li key={i}>{renderInline(item)}</li>)}</ol>
    else node = <p className="mb-5 text-base leading-8 text-gray-700 lg:text-lg lg:leading-9">{renderInline(block.text)}</p>

    return (
      <div key={index}>
        {node}
        {paragraphImages.length > 0 && renderImages(paragraphImages, `p-${index}`)}
      </div>
    )
  })

  const fallbackImages = images.filter((image, index) => !usedImages.has(index))

  return (
    <article className="max-w-none">
      {rendered}
      {fallbackImages.length > 0 && renderImages(fallbackImages, 'fallback')}
    </article>
  )
}
