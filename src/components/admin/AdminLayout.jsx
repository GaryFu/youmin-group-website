import { useState } from 'react'
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Settings, Home, Building2, Factory,
  Microscope, Package, Leaf, Newspaper, Handshake, Phone,
  LogOut, Menu, X, ChevronRight, UserCircle, Heart
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard', label: '管理首页', icon: LayoutDashboard },
  { to: '/admin/site-config', label: '集团信息', icon: Settings },
  { to: '/admin/home', label: '首页内容', icon: Home },
  { to: '/admin/about', label: '集团简介', icon: Building2 },
  { to: '/admin/culture', label: '企业文化', icon: Heart },
  { to: '/admin/industry', label: '产业布局', icon: Factory },
  { to: '/admin/innovation', label: '科研创新', icon: Microscope },
  { to: '/admin/products', label: '产品与服务', icon: Package },
  { to: '/admin/green', label: '绿色发展', icon: Leaf },
  { to: '/admin/news', label: '新闻动态', icon: Newspaper },
  { to: '/admin/partners', label: '合作伙伴', icon: Handshake },
  { to: '/admin/contact', label: '联系我们', icon: Phone },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      navigate('/admin/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-green-900 text-green-100 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-green-800">
          <NavLink to="/admin/dashboard" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              佑
            </div>
            <div>
              <div className="text-sm font-bold text-white">后台管理</div>
              <div className="text-[10px] text-green-400">Admin Panel</div>
            </div>
          </NavLink>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-green-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="py-4 px-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-green-700 text-white font-medium'
                    : 'text-green-200 hover:bg-green-800 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-green-800">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate">{user?.username || user?.email}</div>
              <div className="text-[10px] text-green-400">管理员</div>
            </div>
          </div>
          <NavLink
            to="/admin/profile"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                isActive
                  ? 'bg-green-800 text-white'
                  : 'text-green-300 hover:bg-green-800 hover:text-white'
              }`
            }
          >
            <UserCircle size={16} /> 账号设置
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-green-300 hover:bg-green-800 hover:text-white transition-colors"
          >
            <LogOut size={16} /> 退出登录
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4 lg:px-8 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-gray-600 hover:text-gray-900">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>后台管理</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">
              {navItems.find((i) => location.pathname === i.to || location.pathname.startsWith(i.to + '/'))?.label || ''}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <a href="/" target="_blank" className="text-sm text-green-600 hover:text-green-700 transition-colors">
              查看网站 →
            </a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
