import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, Flag, ArrowRight } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const PAGE_SIZE = 6

function getArticleImages(article) {
  const source = article.images?.length > 0 ? article.images : (article.cover ? [article.cover] : [])
  return source.map((image) => (typeof image === 'string' ? { url: image } : image)).filter((image) => image?.url)
}

export default function PartyBuilding() {
  const { getContent } = useContent()
  const partyContent = getContent('partyBuilding')
  const articles = partyContent.articles || []
  const categories = ['全部', ...new Set(articles.map((a) => a.category).filter(Boolean))]
  const [filter, setFilter] = useState('全部')
  const [page, setPage] = useState(0)
  const filtered = filter === '全部' ? articles : articles.filter((a) => a.category === filter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div>
      <section className="bg-gradient-to-r from-red-800 to-green-900 pt-20 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-red-100 text-sm font-semibold tracking-widest uppercase mb-3">{partyContent.subtitle}</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">{partyContent.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10">
              <Flag size={32} className="mx-auto mb-4 text-red-600" />
              <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">{partyContent.intro}</p>
            </div>
          </ScrollReveal>

          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setFilter(cat); setPage(0) }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === cat ? 'bg-red-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {paged.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paged.map((article) => {
                const cover = getArticleImages(article)[0]
                return (
                  <ScrollReveal key={article.id}>
                    <Link to={`/party-building/${article.id}`} className="block h-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:border-red-200 hover:shadow-lg group">
                      {cover && <img src={cover.url} alt="" className="h-44 w-full object-contain bg-red-50/40" />}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">{article.category || '党建动态'}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar size={12} />{article.date}</span>
                        </div>
                        <h2 className="mb-3 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-red-700">{article.title}</h2>
                        {article.digest && <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">{article.digest}</p>}
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-red-600">
                          阅读全文 <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                )
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">暂无党建文章</div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)} className={`h-10 w-10 rounded-lg text-sm font-medium ${page === i ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-red-50'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
