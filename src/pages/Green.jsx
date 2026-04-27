import { Sprout, Heart, ShieldCheck, Users } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { greenContent } from '../data/content'

const practiceIcons = { Sprout, Heart, ShieldCheck, Users }

export default function Green() {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{greenContent.subtitle}</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{greenContent.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto text-center">
              {greenContent.intro}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Practices */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="PRACTICES" title="绿色实践" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {greenContent.practices.map((practice, i) => {
              const Icon = practiceIcons[practice.icon] || Sprout
              return (
                <ScrollReveal key={i}>
                  <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:border-green-200 transition-all group h-full">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Icon size={24} className="text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{practice.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {practice.points.map((point, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-gray-500 leading-relaxed">
                          <span className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Slogan */}
      <section className="py-20 lg:py-28 bg-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {greenContent.slogan.map((word, i) => (
                <span key={i} className="text-2xl lg:text-3xl font-bold text-white">
                  {word}
                  {i < greenContent.slogan.length - 1 && (
                    <span className="text-green-400 ml-8 hidden sm:inline">｜</span>
                  )}
                </span>
              ))}
            </div>
            <p className="text-green-200/80 text-sm mt-6">
              以公心治企，与伙伴共享成果，坚持绿色发展，实现可持续经营
            </p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
