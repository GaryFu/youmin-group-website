import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Award, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const icons = { Award, BookOpen, GraduationCap }

export default function InnovationDetail() {
  const { index } = useParams()
  const { getContent, content } = useContent()
  const innovationContent = getContent('innovation')
  const achievement = innovationContent.achievements?.[parseInt(index)]

  if (!achievement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {content ? (
            <><h1 className="text-2xl font-bold text-gray-900 mb-4">未找到该内容</h1><Link to="/innovation" className="text-green-600 hover:text-green-700 font-medium">返回科研创新</Link></>
          ) : (
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          )}
        </div>
      </div>
    )
  }

  const Icon = icons[achievement.icon] || Award
  const items = achievement.items || []

  return (
    <div className="pt-16">

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>暂无详细内容，敬请期待</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item, i) => (
                <ScrollReveal key={i}>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden">
                    {(item.images || []).length > 0 && (
                      <div className={`grid gap-0.5 ${item.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {item.images.map((img, j) => (
                          <img key={j} src={img} alt="" className="w-full h-40 object-contain bg-gray-50" />
                        ))}
                      </div>
                    )}
                    <div className="p-5 flex gap-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-green-600">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                        {item.desc && <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="py-8 bg-gray-50 border-t border-gray-100 text-center">
        <Link to="/innovation" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
          <ArrowLeft size={18} /> 返回{innovationContent.title}
        </Link>
      </div>
    </div>
  )
}
