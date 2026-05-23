import { useAuth } from '../../context/AuthContext'
import { useContent } from '../../context/ContentContext'
import { Link } from 'react-router-dom'
import {
  Settings, Home, Building2, Factory, Microscope,
  Package, Leaf, Newspaper, Handshake, Phone, ExternalLink, Flag, Briefcase
} from 'lucide-react'

const cards = [
  { to: '/admin/site-config', label: '集团信息', icon: Settings, desc: '公司名称、地址、联系方式等' },
  { to: '/admin/home', label: '首页内容', icon: Home, desc: 'Hero区、简介、核心优势' },
  { to: '/admin/about', label: '集团简介', icon: Building2, desc: '概况、文化、发展历程' },
  { to: '/admin/industry', label: '产业布局', icon: Factory, desc: '三大板块及子公司' },
  { to: '/admin/innovation', label: '科研创新', icon: Microscope, desc: '研究院、研发中心' },
  { to: '/admin/products', label: '产品与服务', icon: Package, desc: '产品分类及服务项目' },
  { to: '/admin/green', label: '绿色发展', icon: Leaf, desc: '绿色实践、社会责任' },
  { to: '/admin/news', label: '新闻动态', icon: Newspaper, desc: '新闻列表管理' },
  { to: '/admin/party-building', label: '党建', icon: Flag, desc: '党建文章与活动内容' },
  { to: '/admin/recruitment', label: '招聘', icon: Briefcase, desc: '招聘页面与职位管理' },
  { to: '/admin/partners', label: '合作伙伴', icon: Handshake, desc: '合作方分类及名单' },
  { to: '/admin/contact', label: '联系我们', icon: Phone, desc: '联系信息及表单配置' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const { content } = useContent()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">欢迎回来，管理员</h1>
        <p className="text-sm text-gray-500 mt-1">
          登录邮箱：{user?.email} · 上次修改：{content ? '已编辑' : '使用默认内容'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all group"
          >
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
              <card.icon size={20} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{card.label}</h3>
            <p className="text-xs text-gray-500">{card.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
        <ExternalLink size={18} className="text-green-600" />
        <p className="text-sm text-green-800">
          修改内容后请到{' '}
          <a href="/" target="_blank" className="font-medium underline">前台网站</a>
          {' '}查看实际效果。
        </p>
      </div>
    </div>
  )
}
