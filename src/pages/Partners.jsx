import { Building2, GraduationCap, Factory, Ship, Handshake } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const categoryConfig = [
  { icon: GraduationCap, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { icon: Factory, color: 'bg-green-50 text-green-600 border-green-100' },
  { icon: Ship, color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { icon: Handshake, color: 'bg-purple-50 text-purple-600 border-purple-100' },
]

export default function Partners() {
  const { getContent } = useContent()
  const partnersContent = getContent('partners')
  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{partnersContent.subtitle}</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{partnersContent.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center leading-relaxed mb-16">
              {partnersContent.intro}
            </p>
          </ScrollReveal>

          <div className="space-y-14 max-w-5xl mx-auto">
            {partnersContent.categories.map((cat, i) => {
              const config = categoryConfig[i]
              const Icon = config.icon
              return (
                <ScrollReveal key={i}>
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                        {Icon && <Icon size={20} />}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {cat.partners.map((partner, j) => (
                        <div
                          key={j}
                          className="border border-gray-100 rounded-xl p-6 text-center hover:border-green-200 hover:shadow-md transition-all group cursor-default"
                        >
                          {partner.logo ? (
                            <img src={partner.logo} alt={partner.name} className="h-12 mx-auto mb-3 object-contain" />
                          ) : (
                            <Building2 size={28} className="text-gray-300 group-hover:text-green-400 transition-colors mx-auto mb-3" />
                          )}
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            {partner.name || partner}
                          </span>
                        </div>
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
