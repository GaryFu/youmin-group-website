import { Link } from 'react-router-dom'
import { Package, Pill, Stethoscope, Truck, Apple, Dna, Phone } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const categoryIcons = { Package, Pill, Stethoscope, Truck, Apple, Dna }

export default function Products() {
  const { getContent } = useContent()
  const productsContent = getContent('products')
  return (
    <div className="pt-16">

      {/* Product Categories */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsContent.categories.map((cat, i) => {
              const Icon = categoryIcons[cat.icon] || Package
              return (
                <ScrollReveal key={i}>
                  <Link
                    to={`/products/${cat.slug}`}
                    className="block bg-white rounded-xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:border-green-200 transition-all group h-full"
                  >
                    <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-green-100 transition-colors">
                      <Icon size={28} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">{cat.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{cat.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item, j) => (
                        <span
                          key={j}
                          className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-green-800 to-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-white mb-4">产品咨询</h2>
            <p className="text-green-200 text-lg mb-8">对产品感兴趣？联系我们获取报价和技术支持</p>
            <Link to="/contact" className="inline-flex items-center gap-2 bg-gold-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-gold-600 transition-colors shadow-xl shadow-gold-500/30">
              <Phone size={20} /> 立即咨询
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
