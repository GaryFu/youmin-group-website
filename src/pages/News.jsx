import { useState } from 'react'
import { Calendar, ChevronRight } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{newsContent.subtitle}</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{newsContent.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="text-center mb-8">
            <span className="text-sm text-gray-500">
              共 {filtered.length} 篇文章
            </span>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setFilter(cat); setPage(0) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === cat
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paged.map((article, i) => (
              <ScrollReveal key={i}>
                <Link
                  to={article.id ? `/news/${article.id}` : '/news'}
                  className="block bg-white rounded-xl border border-gray-100 p-6 shadow-md hover:shadow-lg hover:border-green-200 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {article.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug mb-3">
                    {article.title}
                  </h3>
                  {article.digest && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">
                      {article.digest}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    阅读详情 <ChevronRight size={14} />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                // Show pages around current page
                const start = Math.max(0, Math.min(page - 5, totalPages - 10))
                const pageNum = start + i
                if (pageNum >= totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      page === pageNum
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-green-50'
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
