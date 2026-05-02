import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CheckCircle2, Phone, ExternalLink, Award, Zap, Shield, Star, TrendingUp, Building2, Factory, Ship } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const featureIcons = { Award, Zap, Shield, Star, TrendingUp, CheckCircle2, Building2, Factory }
const tabIcons = { rd: Building2, agri: Factory, trade: Ship }

export default function CompanyDetail() {
  const { tabId, companyId } = useParams()
  const { getContent } = useContent()
  const industryContent = getContent('industry')
  const tab = industryContent.tabs?.find((t) => t.id === tabId)
  const company = tab?.companies?.find((c) => String(c.id) === companyId)

  if (!tab || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">未找到该单位</h1>
          <Link to="/industry" className="text-green-600 hover:text-green-700 font-medium">返回产业布局</Link>
        </div>
      </div>
    )
  }

  const TabIcon = tabIcons[tab.id] || Building2
  const images = company.images?.length > 0 ? company.images : []
  const hasImages = images.length > 0
  const relatedCompanies = tab.companies?.filter((c) => String(c.id) !== companyId).slice(0, 4) || []

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-green-800 pt-24 pb-0">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #22c55e 0%, transparent 60%), radial-gradient(circle at 70% 30%, #eab308 0%, transparent 40%)' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <ScrollReveal>
            <div className="flex items-center gap-2 text-sm text-green-300/80 mb-8">
              <Link to="/" className="hover:text-white transition-colors">首页</Link>
              <ChevronRight size={14} />
              <Link to="/industry" className="hover:text-white transition-colors">{industryContent.title}</Link>
              <ChevronRight size={14} />
              <Link to="/industry" className="hover:text-white transition-colors">{tab.label}</Link>
              <ChevronRight size={14} />
              <span className="text-gold-400">{company.name}</span>
            </div>
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 text-green-200 border border-white/10 px-3 py-1 rounded-full mb-5">
                  <TabIcon size={14} /> {tab.label}
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">{company.name}</h1>
                {company.tagline && <p className="text-xl text-green-200/80 leading-relaxed mb-8 max-w-xl">{company.tagline}</p>}
                {company.features?.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-green-200 mb-2">
                    <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center"><CheckCircle2 size={16} className="text-gold-400" /></div>
                    <span className="text-sm font-medium">{f.text}</span>
                  </div>
                ))}
                <Link to="/contact" className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-900 px-6 py-3 rounded-xl font-bold text-sm mt-6 transition-all shadow-xl shadow-gold-500/30">
                  <Phone size={18} /> 立即咨询
                </Link>
              </div>
              <div className="lg:col-span-2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-gold-400/20 via-green-400/10 to-transparent rounded-3xl blur-xl" />
                  <div className="relative bg-white rounded-2xl p-3 shadow-2xl">
                    {hasImages ? (
                      <img src={images[0]} alt={company.name} className="w-full object-contain rounded-xl" style={{ maxHeight: '300px' }} />
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
                        <TabIcon size={48} className="text-green-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="h-16 bg-white" style={{ clipPath: 'ellipse(75% 100% at 50% 100%)' }} />
      </section>

      {/* Features */}
      {company.features?.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">核心优势</p>
              <h2 className="text-3xl font-bold text-gray-900">为什么选择{company.name}</h2>
              <div className="w-16 h-1 mx-auto mt-4 bg-gold-400 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {company.features.map((feat, i) => {
                const Icon = featureIcons[feat.icon] || CheckCircle2
                return (
                  <ScrollReveal key={i}>
                    <div className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                        <Icon size={28} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{feat.text}</h3>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Detail + Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">单位详情</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">深入了解{company.name}</h2>
              <div className="space-y-5">
                {(company.fullDescription || company.desc || '').split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed text-base">{p}</p>
                ))}
              </div>
            </div>
            {company.stats?.length > 0 && (
              <div className="lg:col-span-2">
                <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">基本信息</p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {company.stats.map((stat, i) => (
                    <div key={i} className={`flex items-start gap-4 px-6 py-4 ${i < company.stats.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-green-500 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{stat.label}</p>
                        <p className="text-sm text-gray-900 mt-0.5">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {hasImages && images.length > 1 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">GALLERY</p>
              <h2 className="text-2xl font-bold text-gray-900">单位图集</h2>
              <div className="w-10 h-1 mx-auto bg-gold-400 rounded-full" />
            </div>
            <div className={`grid gap-4 ${images.length <= 3 ? 'grid-cols-' + images.length : 'grid-cols-2 lg:grid-cols-3'}`}>
              {images.map((img, i) => (
                <ScrollReveal key={i}>
                  <img src={img} alt={`${company.name} - ${i + 1}`} className="w-full rounded-2xl shadow-lg object-contain bg-gray-50" />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-800 to-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">与{company.name}合作</h2>
          <p className="text-green-200 text-lg mb-8">欢迎联系我们，了解更多合作机会</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-2xl shadow-gold-500/30">
            <Phone size={20} /> 立即咨询
          </Link>
        </div>
      </section>

      {/* Related */}
      {relatedCompanies.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">同板块单位</p>
              <h2 className="text-2xl font-bold text-gray-900">{tab.label}其他单位</h2>
              <div className="w-12 h-1 mx-auto mt-4 bg-gold-400 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedCompanies.map((rc) => (
                <Link key={rc.id} to={`/industry/${tab.id}/${rc.id}`} className="block bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-green-200 transition-all group">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                    <TabIcon size={20} className="text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2 text-sm">{rc.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{rc.tagline || rc.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="py-8 bg-gray-50 border-t border-gray-100 text-center">
        <Link to="/industry" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors">
          <ArrowLeft size={18} /> 返回{industryContent.title}
        </Link>
      </div>
    </div>
  )
}
