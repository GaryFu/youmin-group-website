import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import ArticleContent from '../components/ArticleContent'
import { useContent } from '../context/ContentContext'

function getArticleImages(article) {
  const source = article.images?.length > 0 ? article.images : (article.cover ? [article.cover] : [])
  return source
    .map((image, index) => {
      if (typeof image === 'string') return { url: image, afterParagraph: index === 0 ? null : index }
      return image
    })
    .filter((image) => image?.url)
}

export default function PartyBuildingDetail() {
  const { articleId } = useParams()
  const { getContent, content } = useContent()
  const partyContent = getContent('partyBuilding')
  const articles = partyContent.articles || []
  const idx = articles.findIndex((article) => String(article.id) === articleId)
  const article = idx >= 0 ? articles[idx] : null
  const prev = idx > 0 ? articles[idx - 1] : null
  const next = idx >= 0 && idx < articles.length - 1 ? articles[idx + 1] : null

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {content ? (
            <><h1 className="text-2xl font-bold text-gray-900 mb-4">未找到该文章</h1><Link to="/party-building" className="text-red-600 hover:text-red-700 font-medium">返回党建工作</Link></>
          ) : (
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          )}
        </div>
      </div>
    )
  }

  const images = getArticleImages(article)
  const cover = images[0]
  const inlineImages = images.slice(1)

  return (
    <div>
      <section className="relative bg-gradient-to-r from-red-800 to-green-900 pt-20 pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-center gap-2 text-sm text-red-100 mb-4">
              <Link to="/" className="hover:text-white">首页</Link>
              <ChevronRight size={14} />
              <Link to="/party-building" className="hover:text-white">{partyContent.title}</Link>
              <ChevronRight size={14} />
              <span className="text-gold-400">文章详情</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-red-100 mb-4">
              <Flag size={13} /> {article.category || '党建动态'}
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight">{article.title}</h1>
            <div className="flex items-center gap-4 text-red-100 text-sm">
              <span className="flex items-center gap-1"><Calendar size={14} /> {article.date}</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {cover && (
            <ScrollReveal>
              <img src={cover.url} alt="" className="mb-10 w-full rounded-2xl object-contain bg-red-50 shadow-lg" />
            </ScrollReveal>
          )}
          <ScrollReveal>
            <ArticleContent content={article.content || article.digest || ''} inlineImages={inlineImages} />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6">
            {prev ? (
              <Link to={`/party-building/${prev.id}`} className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-red-200 hover:shadow-md">
                <span className="mb-2 flex items-center gap-1 text-xs text-gray-400"><ChevronLeft size={14} /> 上一篇</span>
                <p className="line-clamp-2 text-sm font-medium text-gray-700 transition-colors group-hover:text-red-700">{prev.title}</p>
              </Link>
            ) : <div />}
            {next ? (
              <Link to={`/party-building/${next.id}`} className="group rounded-xl border border-gray-100 bg-white p-5 text-right shadow-sm transition-all hover:border-red-200 hover:shadow-md">
                <span className="mb-2 flex items-center justify-end gap-1 text-xs text-gray-400">下一篇 <ChevronRight size={14} /></span>
                <p className="line-clamp-2 text-sm font-medium text-gray-700 transition-colors group-hover:text-red-700">{next.title}</p>
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>

      <div className="py-8 bg-gray-50 border-t border-gray-100 text-center">
        <Link to="/party-building" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"><ArrowLeft size={18} /> 返回{partyContent.title}</Link>
      </div>
    </div>
  )
}
