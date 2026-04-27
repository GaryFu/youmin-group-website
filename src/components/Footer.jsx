import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react'

const footerLinks = [
  {
    title: '集团概况',
    links: [
      { to: '/about', label: '集团简介' },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/images/logo-default.png"
                alt="佑民集团"
                className="h-12 w-auto object-contain brightness-110"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-sm">
              以绿色农业与现代畜牧科技为核心，构建研发、农牧、贸易协同发展的全产业链集团。打造世界一流农牧企业，做农民信得过的品牌。
            </p>
            <div className="space-y-2.5 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-green-500" />
                <span>河南省郑州市</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-green-500" />
                <span>400-XXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-green-500" />
                <span>contact@tianyouagri.com</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
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
          <p>© {new Date().getFullYear()} 天佑农牧发展（河南）集团 版权所有</p>
          <p>
            诚信立企 · 科技兴农 · 品质为本 · 服务为心
          </p>
        </div>
      </div>
    </footer>
  )
}
