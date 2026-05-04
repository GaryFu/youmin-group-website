import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CheckCircle2, Phone, MapPin, Building2, Factory, Ship, Calendar, Award } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const tabIcons = { rd: Building2, agri: Factory, trade: Ship }

export default function CompanyDetail() {
  const { tabId, companyId } = useParams()
  const { getContent, content } = useContent()
  const industryContent = getContent('industry')
  const tab = industryContent.tabs?.find((t) => t.id === tabId)
  const company = tab?.companies?.find((c) => String(c.id) === companyId)

  if (!tab) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {content ? (
            <><h1 className="text-2xl font-bold text-gray-900 mb-4">未找到该板块</h1><Link to="/industry" className="text-green-600 hover:text-green-700 font-medium">返回产业布局</Link></>
          ) : (
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          )}
        </div>
      </div>
    )
  }
  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载公司信息...</p>
        </div>
      </div>
    )
  }

  const TabIcon = tabIcons[tab.id] || Building2
  const images = company.images || []
  const milestones = company.milestones || []
  const related = (tab.companies || []).filter((c) => String(c.id) !== companyId).slice(0, 4)

  return (
    <div className="pt-16">
      {/* Hero */}

      {/* Overview + Sidebar */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <ScrollReveal>
                <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">企业概况</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">关于{company.name}</h2>
                <div className="prose max-w-none space-y-5">
                  {(company.overview || company.fullDescription || company.desc || '').split('\n').filter(Boolean).map((p, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed text-base">{p}</p>
                  ))}
                </div>
              </ScrollReveal>

              {/* Features */}
              {company.features?.length > 0 && (
                <div className="mt-12 grid grid-cols-2 gap-4">
                  {company.features.map((feat, i) => (
                    <ScrollReveal key={i}>
                      <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{feat.text}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {images.length > 0 && (
                <ScrollReveal>
                  <img src={images[0]} alt={company.name} className="w-full rounded-2xl shadow-lg object-contain bg-gray-50" />
                </ScrollReveal>
              )}
              {company.stats?.length > 0 && (
                <ScrollReveal>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">基本信息</h3>
                    <div className="space-y-3">
                      {company.stats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-start text-sm">
                          <span className="text-gray-500">{stat.label}</span>
                          <span className="text-gray-900 font-medium text-right max-w-[60%]">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}
              <Link to="/contact" className="block w-full bg-green-600 text-white text-center py-3 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors">
                <Phone size={16} className="inline mr-2" />立即咨询
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      {milestones.length > 0 && (
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-14">
                <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">MILESTONES</p>
                <h2 className="text-3xl font-bold text-gray-900">发展历程</h2>
                <div className="w-16 h-1 mx-auto mt-4 bg-gold-400 rounded-full" />
              </div>
            </ScrollReveal>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-green-200" />
              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <ScrollReveal key={i}>
                    <div className="relative pl-12">
                      <div className="absolute left-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center ring-4 ring-green-100">
                        <Calendar size={14} className="text-white" />
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <span className="text-sm font-bold text-green-600">{m.year}</span>
                        <p className="text-gray-600 mt-1 leading-relaxed">{m.event}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {images.length > 1 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">GALLERY</p>
              <h2 className="text-2xl font-bold text-gray-900">企业图集</h2>
              <div className="w-10 h-1 mx-auto bg-gold-400 rounded-full" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, i) => (
                <ScrollReveal key={i}><img src={img} alt="" className="w-full rounded-xl object-contain bg-gray-50" style={{ maxHeight: '300px' }} /></ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-3">同板块单位</p>
              <h2 className="text-2xl font-bold text-gray-900">{tab.label}其他单位</h2>
              <div className="w-12 h-1 mx-auto mt-4 bg-gold-400 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((rc) => (
                <Link key={rc.id} to={`/industry/${tab.id}/${rc.id}`} className="block bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-green-200 transition-all group">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4"><TabIcon size={20} className="text-green-600" /></div>
                  <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2 text-sm">{rc.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{rc.tagline || rc.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="py-8 bg-white border-t border-gray-100 text-center">
        <Link to="/industry" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"><ArrowLeft size={18} /> 返回{industryContent.title}</Link>
      </div>
    </div>
  )
}
