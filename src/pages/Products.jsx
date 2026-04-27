import { Package, Pill, Stethoscope, Truck, Apple, Dna } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const categoryIcons = { Package, Pill, Stethoscope, Truck, Apple, Dna }

export default function Products() {
  const { getContent } = useContent()
  const productsContent = getContent('products')
  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{productsContent.subtitle}</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{productsContent.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsContent.categories.map((cat, i) => {
              const Icon = categoryIcons[cat.icon] || Package
              return (
                <ScrollReveal key={i}>
                  <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:border-green-200 transition-all group h-full flex flex-col">
                    <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-green-100 transition-colors">
                      <Icon size={28} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{cat.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">{cat.desc}</p>
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
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
