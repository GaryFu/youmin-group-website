import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Calendar, ExternalLink, ChevronLeft } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

export default function NewsDetail() {
  const { articleId } = useParams()
  const { getContent, content } = useContent()
  const newsContent = getContent('news')
  const allArticles = newsContent.articles || []
  const idx = allArticles.findIndex((a) => String(a.id) === articleId)
  const article = idx >= 0 ? allArticles[idx] : null
  const prev = idx > 0 ? allArticles[idx - 1] : null
  const next = idx < allArticles.length - 1 ? allArticles[idx + 1] : null

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {content ? (
            <><h1 className="text-2xl font-bold text-gray-900 mb-4">未找到该文章</h1><Link to="/news" className="text-green-600 hover:text-green-700 font-medium">返回新闻动态</Link></>
          ) : (
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          )}
        </div>
      </div>
    )
  }

  const relatedArticles = allArticles
    .filter((a) => String(a.id) !== articleId && a.category === article.category)
    .slice(0, 4)

  const body = (article.content || article.digest || '').split('\n').filter(Boolean)

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-green-800 to-green-900 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-center gap-2 text-sm text-green-300 mb-4">
              <Link to="/" className="hover:text-white">首页</Link>
              <ChevronRight size={14} />
              <Link to="/news" className="hover:text-white">{newsContent.title}</Link>
              <ChevronRight size={14} />
              <span className="text-gold-400">文章详情</span>
            </div>
            <span className="inline-block text-xs font-medium bg-white/15 text-green-200 px-3 py-1 rounded-full mb-4">
              {article.category}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">{article.title}</h1>
            <div className="flex items-center gap-4 text-green-300 text-sm">
              <span className="flex items-center gap-1"><Calendar size={14} /> {article.date}</span>
              {article.url && (
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <ExternalLink size={14} /> 查看原文
                </a>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {article.cover && (
            <ScrollReveal>
              <img src={article.cover} alt="" className="w-full rounded-2xl object-contain bg-gray-50 mb-10 shadow-lg" />
            </ScrollReveal>
          )}

          <ScrollReveal>
            <article className="prose max-w-none">
              {body.length > 0 ? (
                body.map((p, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed text-base lg:text-lg mb-5">{p}</p>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">暂无详细内容，请查看原文。</p>
              )}
            </article>
          </ScrollReveal>

          {article.url && (
            <div className="mt-10 flex justify-center">
              <a href={article.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20">
                <ExternalLink size={16} /> 在微信中查看原文
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Prev / Next */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6">
            {prev ? (
              <Link to={`/news/${prev.id}`} className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all">
                <span className="flex items-center gap-1 text-xs text-gray-400 mb-2"><ChevronLeft size={14} /> 上一篇</span>
                <p className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors line-clamp-2">{prev.title}</p>
              </Link>
            ) : <div />}
            {next ? (
              <Link to={`/news/${next.id}`} className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all text-right">
                <span className="flex items-center justify-end gap-1 text-xs text-gray-400 mb-2">下一篇 <ChevronRight size={14} /></span>
                <p className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors line-clamp-2">{next.title}</p>
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>

      {/* Related */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">相关文章</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedArticles.map((ra) => (
                <Link key={ra.id} to={`/news/${ra.id}`} className="group bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-all">
                  {ra.cover && <img src={ra.cover} alt="" className="w-full h-24 object-contain rounded-lg mb-3" />}
                  <p className="text-xs text-gray-400 mb-1">{ra.date}</p>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors line-clamp-2">{ra.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="py-8 bg-gray-50 border-t border-gray-100 text-center">
        <Link to="/news" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"><ArrowLeft size={18} /> 返回{newsContent.title}</Link>
      </div>
    </div>
  )
}
