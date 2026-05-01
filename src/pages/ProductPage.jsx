import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CheckCircle2, Phone, ExternalLink, Award, Zap, Shield, Star, TrendingUp } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const featureIcons = { Award, Zap, Shield, Star, TrendingUp, CheckCircle2 }

export default function ProductPage() {
  const { categorySlug, productSlug } = useParams()
  const { getContent } = useContent()
  const productsContent = getContent('products')
  const category = productsContent.categories.find((c) => c.slug === categorySlug)

  // Find product across all sub-categories
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

  // Get related products from same sub-category
  const allProducts = category.subCategories?.flatMap((s) => s.products) || []
  const relatedProducts = allProducts.filter((p) => p.slug !== productSlug).slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 via-green-900 to-green-950 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-green-300 mb-6">
              <Link to="/products" className="hover:text-white transition-colors">{productsContent.title}</Link>
              <ChevronRight size={14} />
              <Link to={`/products/${category.slug}`} className="hover:text-white transition-colors">{category.name}</Link>
              <ChevronRight size={14} />
              <span className="text-white">{product.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex-1">
                {subCategoryName && (
                  <span className="inline-block text-xs font-medium bg-white/15 text-green-200 px-3 py-1 rounded-full mb-4">
                    {subCategoryName}
                  </span>
                )}
                <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3">{product.name}</h1>
                {product.tagline && (
                  <p className="text-lg text-green-200/80 max-w-2xl">{product.tagline}</p>
                )}
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-6 py-3 rounded-xl font-bold text-base transition-colors shadow-xl shadow-gold-500/20 whitespace-nowrap self-start"
              >
                <Phone size={18} />
                {product.ctaText || '立即咨询'}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      {product.features && product.features.length > 0 && (
        <section className="py-14 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.features.map((feat, i) => {
                const Icon = featureIcons[feat.icon] || CheckCircle2
                return (
                  <ScrollReveal key={i}>
                    <div className="text-center p-6 rounded-2xl bg-green-50/50 border border-green-100 hover:shadow-md hover:border-green-200 transition-all">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Icon size={22} className="text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-800">{feat.text}</p>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Description + Specs */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Description */}
          <ScrollReveal>
            <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-2">DETAILS</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">产品详情</h2>
            <div className="prose prose-gray max-w-none">
              {product.desc?.split('\n').filter(Boolean).map((p, i) => (
                <p key={i} className="text-gray-600 leading-relaxed mb-4">{p}</p>
              ))}
            </div>
          </ScrollReveal>

          {/* Specs */}
          {product.specs && product.specs.length > 0 && (
            <ScrollReveal>
              <div className="mt-14">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">技术规格</h2>
                <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                  {product.specs.map((spec, i) => (
                    <div key={i} className={`flex items-center px-6 py-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                      <span className="text-sm font-medium text-gray-500 w-40 shrink-0">{spec.label}</span>
                      <span className="text-sm text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* WeChat link fallback */}
          {product.url && (
            <div className="mt-10 text-center">
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-600 transition-colors"
              >
                <ExternalLink size={14} /> 查看微信公众号原文
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-2 text-center">RELATED</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">相关产品</h2>
              <div className="w-10 h-1 mx-auto bg-gold-400 rounded-full mb-10" />
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rp, i) => (
                <ScrollReveal key={i}>
                  <Link
                    to={`/products/${category.slug}/${rp.slug}`}
                    className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-green-200 transition-all group"
                  >
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2">{rp.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{rp.tagline || rp.desc}</p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back */}
      <div className="py-10 bg-white text-center">
        <Link
          to={`/products/${category.slug}`}
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> 返回{category.name}
        </Link>
      </div>
    </div>
  )
}
