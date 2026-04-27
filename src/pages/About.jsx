import { Building2, Target, Eye, Heart, Handshake } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const cultureIcons = {
  '企业使命': Target,
  '企业愿景': Eye,
  '核心价值观': Heart,
  '经营理念': Handshake,
}

export default function About() {
  const { getContent } = useContent()
  const aboutContent = getContent('about')

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{aboutContent.subtitle}</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{aboutContent.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="OVERVIEW" title={aboutContent.overview.title} />
          <ScrollReveal>
            <div className="max-w-4xl mx-auto space-y-6">
              {aboutContent.overview.paragraphs.map((p, i) => (
                <p key={i} className="text-gray-600 leading-relaxed text-base lg:text-lg">{p}</p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Culture */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title={aboutContent.culture.title} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {aboutContent.culture.items.map((item, i) => {
              const Icon = cultureIcons[item.label] || Building2
              return (
                <ScrollReveal key={i}>
                  <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-md hover:shadow-lg hover:border-green-100 transition-all group h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <Icon size={20} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{item.label}</h3>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.value}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="MILESTONES" title="发展历程" />
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-green-200 md:-translate-x-px" />
            <div className="space-y-8">
              {aboutContent.timeline.map((item, i) => (
                <ScrollReveal key={i}>
                  <div className={`flex items-start gap-6 md:gap-10 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="relative z-10 flex items-center justify-center shrink-0">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-green-200">
                        {item.year.slice(2)}
                      </div>
                    </div>
                    <div className={`flex-1 bg-gray-50 rounded-xl p-6 border border-gray-100 ${i % 2 === 1 ? 'md:text-right' : ''}`}>
                      <span className="text-green-600 font-bold text-lg">{item.year}</span>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">{item.event}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
