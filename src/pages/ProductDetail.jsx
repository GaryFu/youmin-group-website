import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const { getContent } = useContent()
  const productsContent = getContent('products')
  const category = productsContent.categories.find((c) => c.slug === slug)

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

  const paragraphs = category.detailDescription?.split('\n').filter(Boolean) || []

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            {/* Breadcrumb */}
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

      {/* Main Content */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionTitle subtitle="DETAILS" title="产品详情" />
          </ScrollReveal>

          <div className="mt-10 space-y-6">
            {paragraphs.map((p, i) => (
              <ScrollReveal key={i}>
                <p className="text-gray-600 leading-relaxed text-base">{p}</p>
              </ScrollReveal>
            ))}
          </div>

          {/* Service Items */}
          {category.items.length > 0 && (
            <ScrollReveal>
              <div className="mt-12 bg-green-50 rounded-2xl p-8 border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">服务内容</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {category.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Back */}
          <div className="mt-12 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <ArrowLeft size={18} /> 返回产品与服务
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
