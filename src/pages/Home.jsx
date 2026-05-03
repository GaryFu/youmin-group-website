import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, Layers, Leaf, Shield, ChevronRight, Building2, Microscope, Package, Heart, Handshake } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const advantageIcons = { FlaskConical, Layers, Leaf, Shield }

export default function Home() {
  const { getContent } = useContent()
  const site = getContent('site')
  const homeContent = getContent('home')
  const aboutContent = getContent('about')
  const industryContent = getContent('industry')
  const innovationContent = getContent('innovation')
  const productsContent = getContent('products')
  const greenContent = getContent('green')
  const partnersContent = getContent('partners')
  const newsContent = getContent('news')

  return (
    <div>
      {/* ═══ Hero ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="hero">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-950">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{site.shortName} · {site.englishName}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">{homeContent.hero.title}</h1>
            <p className="text-xl lg:text-2xl text-green-100 font-medium mb-4">{homeContent.hero.subtitle}</p>
            <p className="text-base lg:text-lg text-green-200/80 max-w-3xl mx-auto mb-10 leading-relaxed">{homeContent.hero.description}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#about" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">了解集团 <ArrowRight size={18} /></a>
              <Link to="/contact" className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">联系我们</Link>
            </div>
          </ScrollReveal>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══ 集团简介 ═══ */}
      <section id="about" className="py-20 lg:py-28 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle={aboutContent.subtitle} title={aboutContent.title} />
          <ScrollReveal>
            <div className="space-y-5">
              {aboutContent.overview.paragraphs.slice(0, 2).map((p, i) => (
                <p key={i} className="text-gray-600 leading-relaxed text-base lg:text-lg">{p}</p>
              ))}
            </div>
          </ScrollReveal>
          <div className="text-center mt-6">
            <Link to="/about" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm">了解更多 <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ═══ 核心优势 ═══ */}
      <section id="advantages" className="py-20 lg:py-28 bg-green-900 scroll-mt-20">
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

      {/* ═══ 产业布局 ═══ */}
      <section id="industry" className="py-20 lg:py-28 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle={industryContent.subtitle} title={industryContent.title} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {industryContent.tabs.map((tab) => (
              <ScrollReveal key={tab.id}>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all group h-full text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Building2 size={24} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{tab.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{tab.companies.length} 家子公司</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/industry" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm">了解更多 <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ═══ 科研创新 ═══ */}
      <section id="innovation" className="py-20 lg:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle={innovationContent.subtitle} title={innovationContent.title} />
          <ScrollReveal>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-10">{innovationContent.intro}</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {innovationContent.centers.slice(0, 3).map((center) => (
              <ScrollReveal key={center.name}>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-green-200 transition-all">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <Microscope size={20} className="text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{center.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{center.description[0]}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/innovation" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm">了解更多 <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ═══ 产品与服务 ═══ */}
      <section id="products" className="py-20 lg:py-28 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle={productsContent.subtitle} title={productsContent.title} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {productsContent.categories.slice(0, 6).map((cat) => (
              <ScrollReveal key={cat.slug}>
                <Link to={`/products/${cat.slug}`} className="block bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group text-center">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Package size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors">{cat.name}</h3>
                </Link>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/products" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm">了解更多 <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ═══ 绿色发展 ═══ */}
      <section id="green" className="py-20 lg:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle={greenContent.subtitle} title={greenContent.title} />
          <ScrollReveal>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-10">{greenContent.intro}</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {greenContent.practices.map((p) => (
              <ScrollReveal key={p.title}>
                <div className="flex items-start gap-3 bg-green-50 rounded-xl p-5">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0"><Heart size={16} className="text-green-600" /></div>
                  <div><h4 className="text-sm font-bold text-gray-900 mb-1">{p.title}</h4><p className="text-xs text-gray-500 line-clamp-2">{p.points[0]}</p></div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/green" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm">了解更多 <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ═══ 合作伙伴 ═══ */}
      <section id="partners" className="py-20 lg:py-28 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle={partnersContent.subtitle} title={partnersContent.title} />
          <ScrollReveal>
            <p className="text-gray-600 max-w-2xl mx-auto text-center mb-10">{partnersContent.intro}</p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {partnersContent.categories.slice(0, 4).map((cat) => (
              <ScrollReveal key={cat.name}>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Handshake size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{cat.name}</h3>
                  <p className="text-xs text-gray-400">{cat.partners.length} 家合作方</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/partners" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm">了解更多 <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ═══ 新闻动态 ═══ */}
      <section id="news" className="py-20 lg:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="NEWS" title="新闻动态">
            了解{site.shortName}最新动态与发展成果。
          </SectionTitle>
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {newsContent.articles.slice(0, 3).map((article, i) => (
                <Link key={i} to="/news" className="group bg-gray-50 rounded-xl p-6 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-100">
                  <span className="text-xs text-green-600 font-medium">{article.category}</span>
                  <h3 className="text-base font-bold text-gray-900 mt-2 mb-3 group-hover:text-green-700 transition-colors leading-snug">{article.title}</h3>
                  <span className="text-xs text-gray-400">{article.date}</span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
          <div className="text-center mt-8">
            <Link to="/news" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm">查看全部新闻 <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-green-700 to-green-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">携手{site.shortName}，共创绿色农牧未来</h2>
            <p className="text-green-100 text-lg mb-8 leading-relaxed">如果您对产品合作、技术服务或业务咨询感兴趣，欢迎与我们联系</p>
            <Link to="/contact" className="inline-flex items-center gap-2 bg-gold-500 text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-gold-600 transition-colors shadow-xl shadow-gold-500/30">立即咨询 <ArrowRight size={20} /></Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
