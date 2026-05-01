import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CheckCircle2, Phone, ExternalLink, Award, Zap, Shield, Star, TrendingUp, Package, Beaker, Leaf } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const featureIcons = { Award, Zap, Shield, Star, TrendingUp, CheckCircle2, Package, Beaker, Leaf }

export default function ProductPage() {
  const { categorySlug, productSlug } = useParams()
  const { getContent } = useContent()
  const productsContent = getContent('products')
  const category = productsContent.categories.find((c) => c.slug === categorySlug)

  let product = null
  let subCategoryName = ''
  if (category?.subCategories) {
    for (const sub of category.subCategories) {
      const found = sub.products?.find((p) => p.slug === productSlug)
      if (found) { product = found; subCategoryName = sub.name; break }
    }
  }

  if (!category || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">未找到该产品</h1>
          <Link to="/products" className="text-green-600 hover:text-green-700 font-medium">返回产品与服务</Link>
        </div>
      </div>
    )
  }

  const relatedProducts = (category.subCategories || [])
    .flatMap((s) => s.products || [])
    .filter((p) => p.slug !== productSlug)
    .slice(0, 4)

  const hasImage = !!product.image

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-green-800 pt-24 pb-0">
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
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
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
                    className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-900 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-xl shadow-gold-500/30"
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
                  <div className="relative bg-white rounded-2xl p-3 shadow-2xl">
                    {hasImage ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
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
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-14">
                <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">核心优势</p>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">为什么选择{product.name}</h2>
                <div className="w-16 h-1 mx-auto mt-4 bg-gold-400 rounded-full" />
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {product.features.map((feat, i) => {
                const Icon = featureIcons[feat.icon] || CheckCircle2
                return (
                  <ScrollReveal key={i}>
                    <div className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-300 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                        <Icon size={28} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.text}</h3>
                      <p className="text-sm text-gray-400">0{i + 1}</p>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Detail + Specs ── */}
      <section className="py-16 lg:py-24 bg-gray-50">
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
            {product.specs && product.specs.length > 0 && (
              <div className="lg:col-span-2">
                <ScrollReveal>
                  <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">技术规格</p>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {product.specs.map((spec, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-4 px-6 py-4 ${
                          i < product.specs.length - 1 ? 'border-b border-gray-50' : ''
                        }`}
                      >
                        <div className="w-1.5 h-1.5 mt-2 rounded-full bg-green-500 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{spec.label}</p>
                          <p className="text-sm text-gray-900 mt-0.5">{spec.value}</p>
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

      {/* ── Image Gallery or Single Image ── */}
      {hasImage && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <img
                src={product.image}
                alt={product.name}
                className="w-full rounded-2xl shadow-lg object-contain max-h-96"
              />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-green-800 to-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              对{product.name}感兴趣？
            </h2>
            <p className="text-green-200 text-lg mb-8">
              联系我们获取产品报价、样品和技术支持
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-2xl shadow-gold-500/30 hover:scale-105"
            >
              <Phone size={20} /> 立即咨询
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
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
                    to={`/products/${category.slug}/${rp.slug}`}
                    className="block bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-green-200 transition-all group"
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
