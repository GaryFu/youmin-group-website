import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Calendar, ExternalLink } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const { getContent } = useContent()
  const productsContent = getContent('products')
  const category = productsContent.categories.find((c) => c.slug === slug)

  const subCategories = category?.subCategories || []
  const allTab = { name: '全部', products: subCategories.flatMap((s) => s.products) }
  const [activeTab, setActiveTab] = useState(0)

  const tabs = subCategories.length > 1 ? [allTab, ...subCategories] : subCategories
  const currentProducts = tabs[activeTab]?.products || []

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">未找到该产品</h1>
          <Link to="/products" className="text-green-600 hover:text-green-700 font-medium">
            返回产品与服务
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-center gap-2 text-sm text-green-300 mb-4">
              <Link to="/products" className="hover:text-white transition-colors">
                {productsContent.title}
              </Link>
              <ChevronRight size={14} />
              <span className="text-white">{category.name}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">{category.name}</h1>
            <p className="text-green-200/80 max-w-2xl">{category.desc}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Product Catalog */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-2 text-center">CATALOG</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center">目录</h2>
            <div className="w-12 h-1 mx-auto bg-gold-400 rounded-full mb-10" />
          </ScrollReveal>

          {/* Tab Filters */}
          {tabs.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {tabs.map((tab, i) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === i
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  {tab.name}
                  <span className="ml-1.5 text-xs opacity-70">({tab.products.length})</span>
                </button>
              ))}
            </div>
          )}

          {/* Product Cards */}
          {currentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentProducts.map((product, i) => (
                <ScrollReveal key={i}>
                  <Link
                    to={product.id ? `/products/${category.slug}/${product.id}` : `#`}
                    className="block bg-white rounded-xl border border-gray-100 p-6 shadow-md hover:shadow-lg hover:border-green-200 transition-all group h-full"
                  >
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-3 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                      {product.desc}
                    </p>
                    <div className="flex items-center gap-1 mt-4 text-green-600 text-sm font-medium">
                      查看详情 <ExternalLink size={13} />
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              该分类暂无产品，敬请期待
            </div>
          )}
        </div>
      </section>

      {/* Related Articles */}
      {category.relatedArticles && category.relatedArticles.length > 0 && (
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-2 text-center">UPDATES</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">相关动态</h3>
              <div className="w-10 h-1 mx-auto bg-gold-400 rounded-full mb-8" />
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-3">
              {category.relatedArticles.map((article, i) => (
                <a
                  key={i}
                  href={article.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 bg-white hover:bg-green-50 rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-all"
                >
                  <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5 flex items-center gap-1">
                    <Calendar size={12} />
                    {article.date?.slice(0, 7)}
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-green-700 transition-colors leading-snug flex-1">
                    {article.title}
                  </span>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-green-500 shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back */}
      <div className="py-8 bg-white text-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> 返回产品与服务
        </Link>
      </div>
    </div>
  )
}
