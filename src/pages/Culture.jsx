import { Target, Eye, Shield, Heart, Sparkles, Zap, TrendingUp, Users, ThumbsUp, Star, Handshake, Leaf, ClipboardCheck } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const cultureIcons = {
  '企业使命': Target,
  '企业愿景': Eye,
  '三大铁律': Shield,
  '经营理念': TrendingUp,
  '指导思想': Zap,
  '五大底气': Sparkles,
  '服务宗旨': Heart,
  '员工精神': Users,
  '企业精神': Star,
  '质量承诺': Shield,
  '核心价值观': Heart,
  '企业治理方针': Leaf,
  '企业管理方针': ClipboardCheck,
}

export default function Culture() {
  const { getContent } = useContent()
  const cultureContent = getContent('culture')

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-20 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{cultureContent.subtitle}</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">{cultureContent.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      {/* Culture Items */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="CULTURE" title="企业文化" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {cultureContent.items.map((item, i) => {
              const Icon = cultureIcons[item.label] || Star
              return (
                <ScrollReveal key={i}>
                  <div className="group bg-white border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg hover:border-green-200 transition-all h-full flex gap-4">
                    <div className="shrink-0">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <Icon size={24} className="text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.value}</p>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Motto */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-green-800 to-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">MOTTO</p>
            <p className="text-2xl lg:text-3xl font-bold text-white leading-relaxed">
              {cultureContent.motto}
            </p>
            <div className="w-12 h-1 mx-auto mt-6 bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
