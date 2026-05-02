import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Factory, Ship } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const tabIcons = { rd: Building2, agri: Factory, trade: Ship }

export default function Industry() {
  const [activeTab, setActiveTab] = useState('rd')
  const { getContent } = useContent()
  const industryContent = getContent('industry')
  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{industryContent.subtitle}</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{industryContent.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      {/* Industry Layout */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="THREE PILLARS" title="三大产业板块" />

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {industryContent.tabs.map((tab) => {
              const Icon = tabIcons[tab.id]
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                    active
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                      : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  {Icon && <Icon size={18} />}
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <ScrollReveal key={activeTab}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {industryContent.tabs
                .find((t) => t.id === activeTab)
                ?.companies.map((company, i) => (
                  <Link
                    key={i}
                    to={`/industry/${activeTab}/${company.id}`}
                    className="block bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold text-sm mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{company.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{company.desc}</p>
                  </Link>
                ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Industry Map */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="产业协同格局" />
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                {[
                  { label: '研发板块', desc: '驱动创新', color: 'bg-green-100 border-green-300 text-green-800' },
                  { label: '农牧板块', desc: '核心生产', color: 'bg-green-500 border-green-600 text-white' },
                  { label: '贸易板块', desc: '流通赋能', color: 'bg-gold-100 border-gold-300 text-gold-800' },
                ].map((item, i) => (
                  <div key={i} className="flex-1 w-full">
                    <div className={`rounded-xl p-8 border-2 text-center ${item.color} shadow-lg`}>
                      <h3 className="text-xl font-bold mb-1">{item.label}</h3>
                      <p className="text-sm opacity-80">{item.desc}</p>
                    </div>
                    {i < 2 && (
                      <div className="flex justify-center my-3 md:hidden">
                        <div className="w-0.5 h-6 bg-green-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Arrows between on desktop */}
              <div className="hidden md:flex justify-center gap-16 mt-3">
                <div className="text-green-400 text-2xl">↔</div>
                <div className="text-green-400 text-2xl">↔</div>
              </div>
              <p className="text-center text-gray-500 text-sm mt-8 leading-relaxed">
                三大板块协同发展，形成研发驱动、农牧支撑、贸易赋能的产业生态闭环
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
