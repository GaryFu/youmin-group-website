import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowRight, Eye } from 'lucide-react'
import { useContent } from '../context/ContentContext'

const footerLinkHash = { '/about': 'about', '/culture': 'culture', '/industry': 'industry', '/innovation': 'innovation', '/products': 'products', '/green': 'green', '/partners': 'partners', '/news': 'news' }

const footerLinks = [
  {
    title: '集团概况',
    links: [
      { to: '/about', label: '集团简介' },
      { to: '/culture', label: '企业文化' },
      { to: '/industry', label: '产业布局' },
      { to: '/innovation', label: '科研创新' },
    ],
  },
  {
    title: '业务板块',
    links: [
      { to: '/products', label: '产品与服务' },
      { to: '/green', label: '绿色发展' },
      { to: '/partners', label: '合作伙伴' },
    ],
  },
  {
    title: '新闻资讯',
    links: [
      { to: '/news', label: '新闻动态' },
      { to: '/contact', label: '联系我们' },
    ],
  },
]

export default function Footer() {
  const { getContent } = useContent()
  const site = getContent('site')
  const [visitCount, setVisitCount] = useState(null)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    fetch('/api/content/visitor/count').then(r => r.json()).then(d => setVisitCount(d.count)).catch(() => {})
  }, [])

  const scrollTo = (e, to) => {
    const hash = footerLinkHash[to]
    if (isHome && hash) {
      e.preventDefault()
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Top bar */}
      <div className="bg-green-900 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-green-100">
          <span>公心治企</span>
          <span className="hidden sm:inline text-green-400">｜</span>
          <span>共享成果</span>
          <span className="hidden sm:inline text-green-400">｜</span>
          <span>绿色发展</span>
          <span className="hidden sm:inline text-green-400">｜</span>
          <span>可持续经营</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={(e) => scrollTo(e, link.to)}
                      className="text-sm text-gray-400 hover:text-green-400 transition-colors inline-flex items-center gap-1 group"
                    >
                      <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {site.name} 版权所有</p>
          <div className="flex items-center gap-4">
            {visitCount !== null && (
              <span className="flex items-center gap-1 text-gray-600">
                <Eye size={12} /> {visitCount.toLocaleString()} 次访问
              </span>
            )}
            <span>{site.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
