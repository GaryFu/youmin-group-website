import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Phone, ExternalLink, X, ZoomIn, Award, Zap, Shield, Star, TrendingUp, Package, Beaker, Leaf } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const featureIcons = { Award, Zap, Shield, Star, TrendingUp, CheckCircle2, Package, Beaker, Leaf }
const visualSpecPrefix = '视觉识别-'

function formatSpecLabel(label) {
  return label?.startsWith(visualSpecPrefix) ? label.slice(visualSpecPrefix.length) : label
}

function isWatermarkSpecValue(value) {
  const normalized = String(value || '').trim()
  return /^(?:微信|公众号|YOMAN佑民|股份)$/.test(normalized) || /^[^；,，、\s]{0,4}民股份$/.test(normalized)
}

function buildDisplaySpecs(specs = []) {
  const visualSpecs = []
  const otherSpecs = []

  for (const spec of specs) {
    if (spec.label?.startsWith(visualSpecPrefix)) {
      visualSpecs.push(spec)
    } else {
      otherSpecs.push(spec)
    }
  }

  if (visualSpecs.length === 0) return otherSpecs

  const visualValue = visualSpecs
    .map((spec) => {
      const label = formatSpecLabel(spec.label)
      return label ? `${label}：${spec.value}` : spec.value
    })
    .filter((value) => !isWatermarkSpecValue(value.split('：').at(-1)))
    .filter(Boolean)
    .join('；')

  return visualValue
    ? [
        ...otherSpecs,
        {
          label: '技术指标',
          value: visualValue,
        },
      ]
    : otherSpecs
}

export default function ProductPage() {
  const { categorySlug, productId } = useParams()
  const { getContent, content } = useContent()
  const productsContent = getContent('products')
  const category = productsContent.categories.find((c) => c.slug === categorySlug)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  useEffect(() => {
    setActiveImageIndex(0)
    setIsLightboxOpen(false)
  }, [productId])

  useEffect(() => {
    if (!isLightboxOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsLightboxOpen(false)
      if (event.key === 'ArrowLeft') setActiveImageIndex((index) => Math.max(0, index - 1))
      if (event.key === 'ArrowRight') setActiveImageIndex((index) => Math.min(images.length - 1, index + 1))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen])

  let product = null
  let subCategoryName = ''
  if (category?.subCategories) {
    for (const sub of category.subCategories) {
      const found = sub.products?.find((p) => String(p.id) === productId)
      if (found) { product = found; subCategoryName = sub.name; break }
    }
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {content ? (
            <><h1 className="text-2xl font-bold text-gray-900 mb-4">未找到该分类</h1><Link to="/products" className="text-green-600 hover:text-green-700 font-medium">返回产品与服务</Link></>
          ) : (
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          )}
        </div>
      </div>
    )
  }
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载产品信息...</p>
        </div>
      </div>
    )
  }

  const relatedProducts = (category.subCategories || [])
    .flatMap((s) => s.products || [])
    .filter((p) => String(p.id) !== productId)
    .slice(0, 4)

  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : [])
  const hasImages = images.length > 0
  const activeImage = hasImages ? images[Math.min(activeImageIndex, images.length - 1)] : null
  const displaySpecs = buildDisplaySpecs(product.specs)
  const openImage = (index) => {
    setActiveImageIndex(index)
    setIsLightboxOpen(true)
  }
  const showPreviousImage = () => setActiveImageIndex((index) => Math.max(0, index - 1))
  const showNextImage = () => setActiveImageIndex((index) => Math.min(images.length - 1, index + 1))

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-green-800 pt-20 pb-0">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, #22c55e 0%, transparent 60%), radial-gradient(circle at 70% 30%, #eab308 0%, transparent 40%)'
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <ScrollReveal>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-green-300/80 mb-8">
              <Link to="/" className="hover:text-white transition-colors">首页</Link>
              <ChevronRight size={14} />
              <Link to="/products" className="hover:text-white transition-colors">{productsContent.title}</Link>
              <ChevronRight size={14} />
              <Link to={`/products/${category.slug}`} className="hover:text-white transition-colors">{category.name}</Link>
              <ChevronRight size={14} />
              <span className="text-gold-400">{product.name}</span>
            </div>

            <div className="grid lg:grid-cols-5 gap-12 items-center">
              {/* Left: Text */}
              <div className="lg:col-span-3">
                {subCategoryName && (
                  <span className="inline-block text-xs font-medium bg-white/10 text-green-200 border border-white/10 px-3 py-1 rounded-full mb-5">
                    {subCategoryName}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-5 leading-tight tracking-tight">
                  {product.name}
                </h1>
                {product.tagline && (
                  <p className="text-xl text-green-200/80 leading-relaxed mb-8 max-w-xl">
                    {product.tagline}
                  </p>
                )}

                {/* Quick stats */}
                <div className="flex flex-wrap gap-6 mb-8">
                  {product.features?.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-green-200">
                      <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-gold-400" />
                      </div>
                      <span className="text-sm font-medium">{f.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-gold-500 text-white hover:bg-gold-600 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-xl shadow-gold-500/30"
                  >
                    <Phone size={18} /> 立即咨询
                  </Link>
                  {product.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-green-200 hover:text-white px-4 py-2 rounded-xl text-sm transition-colors"
                    >
                      <ExternalLink size={14} /> 查看产品原文
                    </a>
                  )}
                </div>
              </div>

              {/* Right: Image */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-gold-400/20 via-green-400/10 to-transparent rounded-3xl blur-xl" />
                  <div className="relative overflow-hidden bg-white rounded-xl shadow-2xl">
                    {hasImages ? (
                      <button
                        type="button"
                        onClick={() => openImage(0)}
                        aria-label={`放大查看${product.name}主图`}
                        className="group block w-full text-left"
                      >
                        <span className="relative flex aspect-[4/3] max-h-[520px] items-center justify-center bg-gray-50 p-3 sm:p-4">
                          <img
                            src={images[0]}
                            alt={product.name}
                            className="max-h-full w-full rounded-lg object-contain"
                          />
                          <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900/70 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            <ZoomIn size={18} />
                          </span>
                        </span>
                      </button>
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <Package size={48} className="text-green-300 mx-auto mb-2" />
                          <span className="text-sm text-green-400">{product.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Wave divider */}
        <div className="h-16 bg-white" style={{ clipPath: 'ellipse(75% 100% at 50% 100%)' }} />
      </section>

      {/* ── Features Grid ── */}
      {product.features && product.features.length > 0 && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-10">
                <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">核心优势</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">为什么选择{product.name}</h2>
                <div className="w-16 h-1 mx-auto mt-4 bg-gold-400 rounded-full" />
              </div>
            </ScrollReveal>

            <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3 sm:gap-4">
              {product.features.map((feat, i) => {
                const Icon = featureIcons[feat.icon] || CheckCircle2
                return (
                  <ScrollReveal key={i} className="w-full min-w-0 sm:w-56 lg:w-auto lg:flex-1 lg:basis-0">
                    <div className="group flex min-h-20 items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:border-green-200 hover:shadow-md">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 transition-colors group-hover:bg-green-100">
                        <Icon size={20} className="text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold leading-snug text-gray-900 [word-break:keep-all]">{feat.text}</h3>
                        <p className="mt-1 text-xs font-medium text-gray-400">0{i + 1}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Detail + Specs ── */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Description */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">产品详情</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">深入了解{product.name}</h2>
                <div className="prose max-w-none space-y-5">
                  {product.desc?.split('\n').filter(Boolean).map((p, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed text-base">
                      {i === 0 && (
                        <span className="float-left text-5xl font-serif font-bold text-green-600 leading-none mr-3 mt-0.5">"</span>
                      )}
                      {p}
                    </p>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* Specs */}
            {displaySpecs.length > 0 && (
              <div className="lg:col-span-2">
                <ScrollReveal>
                  <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">技术规格</p>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {displaySpecs.map((spec, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-4 px-6 py-4 ${
                          i < displaySpecs.length - 1 ? 'border-b border-gray-50' : ''
                        }`}
                      >
                        <div className="w-1.5 h-1.5 mt-2 rounded-full bg-green-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{spec.label}</p>
                          <p className="text-sm text-gray-900 mt-0.5 leading-6">{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Image Gallery ── */}
      {hasImages && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3 text-center">GALLERY</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">产品图集</h2>
              <div className="w-10 h-1 mx-auto bg-gold-400 rounded-full mb-10" />
            </ScrollReveal>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-start">
              <ScrollReveal>
                <figure className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                  <button
                    type="button"
                    onClick={() => openImage(activeImageIndex)}
                    aria-label={`放大查看${product.name}当前图片`}
                    className="group relative flex min-h-[320px] max-h-[680px] w-full items-center justify-center p-3 sm:p-5"
                  >
                    <img
                      src={activeImage}
                      alt={`${product.name} - 当前展示图`}
                      className="max-h-[640px] w-full object-contain"
                    />
                    <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-gray-900/70 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <ZoomIn size={20} />
                    </span>
                  </button>
                </figure>
              </ScrollReveal>

              {images.length > 1 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  {images.map((img, i) => (
                    <ScrollReveal key={img}>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex(i)}
                        aria-label={`切换到${product.name}图片 ${i + 1}`}
                        className={`group block w-full overflow-hidden rounded-xl border bg-gray-50 p-2 text-left shadow-sm transition-all ${
                          activeImageIndex === i
                            ? 'border-green-500 ring-2 ring-green-500/15'
                            : 'border-gray-100 hover:border-green-300 hover:shadow-md'
                        }`}
                      >
                        <span className="flex aspect-[4/3] items-center justify-center">
                          <img
                            src={img}
                            alt={`${product.name} - ${i + 1}`}
                            className="max-h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </span>
                      </button>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {hasImages && isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 px-4 py-5 sm:px-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute left-4 top-4 text-sm font-medium text-white/70">
            {activeImageIndex + 1} / {images.length}
          </div>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="关闭图片查看"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>

          {images.length > 1 && activeImageIndex > 0 && (
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); showPreviousImage() }}
              aria-label="上一张图片"
              className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          <div
            className="flex h-full w-full max-w-7xl flex-col items-center justify-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={`${product.name} - 放大图`}
              className="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <div className="flex flex-wrap items-center justify-center gap-2">
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    disabled={activeImageIndex === 0}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} /> 上一张
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    disabled={activeImageIndex === images.length - 1}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    下一张 <ChevronRight size={16} />
                  </button>
                </>
              )}
              <a
                href={activeImage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500"
              >
                <ExternalLink size={16} /> 打开原图
              </a>
            </div>
          </div>

          {images.length > 1 && activeImageIndex < images.length - 1 && (
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); showNextImage() }}
              aria-label="下一张图片"
              className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex"
            >
              <ChevronRight size={26} />
            </button>
          )}
        </div>
      )}

      {/* ── CTA ── */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-green-800 to-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              对{product.name}感兴趣？
            </h2>
            <p className="text-green-200 text-lg mb-8">
              联系我们获取产品报价、样品和技术支持
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gold-500 text-white hover:bg-gold-600 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-2xl shadow-gold-500/30 hover:scale-105"
            >
              <Phone size={20} /> 立即咨询
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">相关产品</p>
                <h2 className="text-2xl font-bold text-gray-900">您可能也感兴趣</h2>
                <div className="w-12 h-1 mx-auto mt-4 bg-gold-400 rounded-full" />
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((rp, i) => (
                <ScrollReveal key={i}>
                  <Link
                    to={`/products/${category.slug}/${rp.id}`}
                    className="block bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-green-200 transition-all group"
                  >
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                      <Package size={20} className="text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2 text-sm">{rp.name}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{rp.tagline || rp.desc}</p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Back ── */}
      <div className="py-8 bg-gray-50 border-t border-gray-100 text-center">
        <Link
          to={`/products/${category.slug}`}
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> 返回{category.name}目录
        </Link>
      </div>
    </div>
  )
}
