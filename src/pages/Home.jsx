import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, Layers, Leaf, Shield, ChevronRight } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import Card from '../components/Card'
import ScrollReveal from '../components/ScrollReveal'
import { homeContent, newsContent } from '../data/content'

const advantageIcons = { FlaskConical, Layers, Leaf, Shield }

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-950">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }} />
        </div>
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-[0.3em] uppercase mb-6">
              佑民集团 · YOU MIN GROUP
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              {homeContent.hero.title}
            </h1>
          </ScrollReveal>
          <ScrollReveal>
            <p className="text-xl lg:text-2xl text-green-100 font-medium mb-4">
              {homeContent.hero.subtitle}
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <p className="text-base lg:text-lg text-green-200/80 max-w-3xl mx-auto mb-10 leading-relaxed">
              {homeContent.hero.description}
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/about" className="btn-primary text-base">
                了解集团 <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors text-base">
                联系我们
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle={homeContent.intro.subtitle} title={homeContent.intro.title}>
            以绿色农业与现代畜牧科技为核心，构建研发、农牧、贸易协同发展的全产业链集团。
          </SectionTitle>
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {homeContent.intro.paragraphs.map((p, i) => (
                <div key={i} className="bg-green-50/50 rounded-xl p-8 border border-green-100">
                  <p className="text-gray-600 leading-relaxed text-base">{p}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Business Pillars */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="BUSINESS PILLARS" title="三大业务板块" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: '研发板块', desc: '天佑畜牧健康研究院、省级教保料研发中心、省级添加剂研发中心等科研平台，驱动产业技术创新。', to: '/industry' },
              { title: '农牧板块', desc: '河南佑民生物科技、河南佑美饲料、河南蛋好多农牧等多家子公司，覆盖饲料、养殖、食品全链条。', to: '/industry' },
              { title: '贸易板块', desc: '郑州羽翠供应链、郑州德福仁生物、厦门爱德唯康、天津润泽等，构建农牧贸易供应链网络。', to: '/industry' },
            ].map((pillar, i) => (
              <ScrollReveal key={i}>
                <div className="bg-white rounded-xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 group h-full flex flex-col">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mb-4">
                    0{i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{pillar.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm flex-1">{pillar.desc}</p>
                  <Link
                    to={pillar.to}
                    className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm mt-4 group/link"
                  >
                    了解更多 <ChevronRight size={16} className="group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20 lg:py-28 bg-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="CORE ADVANTAGES" title="核心优势" light />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeContent.advantages.map((item, i) => {
              const IconComp = advantageIcons[item.icon]
              return (
                <ScrollReveal key={i}>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors group h-full">
                    <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-400/30 transition-colors">
                      {IconComp && <IconComp className="text-green-300" size={24} />}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-green-200/80 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="NEWS" title="新闻动态">
            了解天佑农牧集团最新动态与发展成果。
          </SectionTitle>
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {newsContent.articles.slice(0, 3).map((article, i) => (
                <Link
                  key={i}
                  to="/news"
                  className="group bg-gray-50 rounded-xl p-6 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-100"
                >
                  <span className="text-xs text-green-600 font-medium">{article.category}</span>
                  <h3 className="text-base font-bold text-gray-900 mt-2 mb-3 group-hover:text-green-700 transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <span className="text-xs text-gray-400">{article.date}</span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
          <div className="text-center mt-10">
            <Link to="/news" className="btn-outline text-sm">
              查看全部新闻 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-green-700 to-green-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              携手天佑，共创绿色农牧未来
            </h2>
            <p className="text-green-100 text-lg mb-8 leading-relaxed">
              如果您对产品合作、技术服务或业务咨询感兴趣，欢迎与我们联系
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 bg-gold-500 text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-gold-600 transition-colors shadow-xl shadow-gold-500/30">
              立即咨询 <ArrowRight size={20} />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
