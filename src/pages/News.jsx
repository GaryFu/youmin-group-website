import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, ArrowRight } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

const PAGE_SIZE = 6

export default function News() {
  const { getContent } = useContent()
  const newsContent = getContent('news')
  const allCategories = ['全部', ...new Set(newsContent.articles.map((a) => a.category))]
  const [filter, setFilter] = useState('全部')
  const [page, setPage] = useState(0)

  const filtered = filter === '全部'
    ? newsContent.articles
    : newsContent.articles.filter((a) => a.category === filter)

  const totalPages = Math.ceil((filtered.length - 1) / PAGE_SIZE)
  const hasFeatured = filtered.length > 0
  const featured = hasFeatured ? filtered[0] : null
  const paged = filtered.slice(1).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="pt-16">

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {allCategories.map((cat) => {
              const count = cat === '全部' ? newsContent.articles.length : newsContent.articles.filter(a => a.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => { setFilter(cat); setPage(0) }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === cat
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  {cat} <span className="ml-1 text-xs opacity-70">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Featured article */}
          {featured && (
            <ScrollReveal>
              <Link to={`/news/${featured.id}`} className="block mb-10 group">
                <div className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl hover:border-green-200 transition-all overflow-hidden">
                  <div className="grid md:grid-cols-5">
                    {featured.cover && (
                      <div className="md:col-span-2 bg-gray-50">
                        <img src={featured.cover} alt="" className="w-full h-48 md:h-full object-contain" />
                      </div>
                    )}
                    <div className={`p-8 flex flex-col justify-center ${featured.cover ? 'md:col-span-3' : 'md:col-span-5'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium bg-green-50 text-green-600 px-2.5 py-1 rounded-full">{featured.category}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} />{featured.date}</span>
                      </div>
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-3 leading-snug">{featured.title}</h2>
                      {featured.digest && (
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{featured.digest}</p>
                      )}
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                        阅读全文 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          )}

          {/* Article grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paged.map((article, i) => (
              <ScrollReveal key={i}>
                <Link
                  to={`/news/${article.id}`}
                  className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all group h-full overflow-hidden"
                >
                  {article.cover && (
                    <div className="bg-gray-50">
                      <img src={article.cover} alt="" className="w-full h-40 object-contain" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium bg-green-50 text-green-600 px-2.5 py-1 rounded-full">{article.category}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} />{article.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug mb-3">{article.title}</h3>
                    {article.digest && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{article.digest}</p>
                    )}
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-4">
                      阅读详情 <ChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">暂无文章</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 5, totalPages - 10))
                const pageNum = start + i
                if (pageNum >= totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      page === pageNum ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-green-50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
