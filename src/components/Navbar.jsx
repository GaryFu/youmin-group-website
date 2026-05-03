import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useContent } from '../context/ContentContext'

const navLinks = [
  { to: '/', hash: '', label: '首页' },
  { to: '/products', hash: 'products', label: '产品与服务' },
  { to: '/news', hash: 'news', label: '新闻动态' },
  { to: '/about', hash: 'about', label: '集团简介' },
  { to: '/culture', hash: 'culture', label: '企业文化' },
  { to: '/industry', hash: 'industry', label: '产业布局' },
  { to: '/innovation', hash: 'innovation', label: '科研创新' },
  { to: '/green', hash: 'green', label: '绿色发展' },
  { to: '/partners', hash: 'partners', label: '合作伙伴' },
  { to: '/contact', hash: '', label: '联系我们' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { getContent } = useContent()
  const site = getContent('site')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const isHome = location.pathname === '/'

  const handleNavClick = (e, link) => {
    if (isHome && link.hash) {
      e.preventDefault()
      const el = document.getElementById(link.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileOpen(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-gray-200/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0 shrink-0">
            <img
              src={
                location.pathname === '/' && !scrolled
                  ? '/images/logo-white-v2.png'
                  : '/images/logo-default.png'
              }
              alt={site.shortName}
              className="h-10 lg:h-12 w-auto object-contain transition-all duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = link.to === '/' ? location.pathname === '/' : location.pathname === link.to || (isHome && location.hash === '#' + link.hash)
              const NavLink = isHome && link.hash ? 'a' : Link
              const navProps = isHome && link.hash ? { href: '#' + link.hash, onClick: (e) => handleNavClick(e, link) } : { to: link.to }
              return (
                <NavLink key={link.to} {...navProps}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? scrolled ? 'text-green-700 bg-green-50' : 'text-white bg-white/20'
                      : scrolled ? 'text-gray-600 hover:text-green-700 hover:bg-green-50' : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </NavLink>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              const MobileLink = isHome && link.hash ? 'a' : Link
              const mobileProps = isHome && link.hash ? { href: '#' + link.hash, onClick: (e) => handleNavClick(e, link) } : { to: link.to }
              return (
                <MobileLink key={link.to} {...mobileProps}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  {link.label}
                </MobileLink>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
