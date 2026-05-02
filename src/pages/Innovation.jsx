import { Link } from 'react-router-dom'
import { Microscope, Beaker, Atom, Award, BookOpen, GraduationCap, ArrowRight } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const centerIcons = { Microscope, Beaker, Atom }
const achievementIcons = { Award, BookOpen, GraduationCap }

export default function Innovation() {
  const { getContent } = useContent()
  const innovationContent = getContent('innovation')
  const achievements = innovationContent.achievements || []

  return (
    <div>
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{innovationContent.subtitle}</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{innovationContent.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto text-center">
              {innovationContent.intro}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-14">
            {achievements.map((item, i) => {
              const Icon = achievementIcons[item.icon] || Award
              return (
                <ScrollReveal key={i}>
                  <Link to={`/innovation/${i}`} className="block text-center group">
                    <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-100 transition-colors">
                      <Icon size={24} className="text-green-600" />
                    </div>
                    <div className="text-3xl font-extrabold text-green-700 group-hover:text-green-800 transition-colors">{item.value}</div>
                    <div className="text-sm text-gray-500 mt-1 group-hover:text-gray-700 transition-colors flex items-center justify-center gap-1">
                      {item.label} <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="RESEARCH CENTERS" title="科研平台" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {innovationContent.centers.map((center, i) => {
              const Icon = centerIcons[center.icon]
              return (
                <ScrollReveal key={i}>
                  <div className="bg-white rounded-xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all h-full">
                    <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                      {Icon && <Icon size={28} className="text-white" />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{center.name}</h3>
                    <ul className="space-y-3">
                      {center.description.map((desc, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-gray-500 leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 shrink-0" />
                          {desc}
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
    </div>
  )
}
