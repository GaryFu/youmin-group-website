import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Calendar, ExternalLink, Tag } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

export default function NewsDetail() {
  const { articleId } = useParams()
  const { getContent, content } = useContent()
  const newsContent = getContent('news')
  const article = newsContent.articles?.find((a) => String(a.id) === articleId)

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

  const relatedArticles = newsContent.articles
    ?.filter((a) => String(a.id) !== articleId && a.category === article.category)
    .slice(0, 4) || []

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-28 pb-20">
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

      {/* Article body */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-10">
            {/* Main content */}
            <div className="lg:col-span-3">
              {article.cover && (
                <ScrollReveal>
                  <img src={article.cover} alt="" className="w-full rounded-xl object-contain bg-gray-50 mb-8" />
                </ScrollReveal>
              )}
              <ScrollReveal>
                <div className="prose max-w-none">
                  {(article.content || article.digest)?.split('\n').filter(Boolean).map((p, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed text-base mb-4">{p}</p>
                  ))}
                  {!article.content && !article.digest && (
                    <p className="text-gray-400">暂无详细内容，请点击"查看原文"阅读完整文章。</p>
                  )}
                </div>
              </ScrollReveal>
              {article.url && (
                <div className="mt-8">
                  <a href={article.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    <ExternalLink size={16} /> 在微信中查看原文
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar */}
            {relatedArticles.length > 0 && (
              <div className="lg:col-span-1">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">相关文章</h3>
                <div className="space-y-3">
                  {relatedArticles.map((ra) => (
                    <Link key={ra.id} to={`/news/${ra.id}`} className="block group">
                      <p className="text-xs text-gray-400 mb-1">{ra.date}</p>
                      <p className="text-sm text-gray-700 group-hover:text-green-700 transition-colors leading-snug line-clamp-2">{ra.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="py-8 bg-gray-50 border-t border-gray-100 text-center">
        <Link to="/news" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"><ArrowLeft size={18} /> 返回{newsContent.title}</Link>
      </div>
    </div>
  )
}
