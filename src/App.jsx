import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import { useAuth } from './context/AuthContext'

import Home from './pages/Home'
import About from './pages/About'
import Industry from './pages/Industry'
import Innovation from './pages/Innovation'
import Products from './pages/Products'
import Green from './pages/Green'
import News from './pages/News'
import Partners from './pages/Partners'
import Contact from './pages/Contact'

import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSiteConfig from './pages/admin/AdminSiteConfig'
import AdminHome from './pages/admin/AdminHome'
import AdminAbout from './pages/admin/AdminAbout'
import AdminIndustry from './pages/admin/AdminIndustry'
import AdminInnovation from './pages/admin/AdminInnovation'
import AdminProducts from './pages/admin/AdminProducts'
import AdminGreen from './pages/admin/AdminGreen'
import AdminNews from './pages/admin/AdminNews'
import AdminPartners from './pages/admin/AdminPartners'
import AdminContact from './pages/admin/AdminContact'

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}

function FrontendLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Admin routes — isolated from front-end Layout */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="site-config" element={<AdminSiteConfig />} />
        <Route path="home" element={<AdminHome />} />
        <Route path="about" element={<AdminAbout />} />
        <Route path="industry" element={<AdminIndustry />} />
        <Route path="innovation" element={<AdminInnovation />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="green" element={<AdminGreen />} />
        <Route path="news" element={<AdminNews />} />
        <Route path="partners" element={<AdminPartners />} />
        <Route path="contact" element={<AdminContact />} />
      </Route>

      {/* Front-end routes — wrapped in Navbar + Footer Layout */}
      <Route element={<FrontendLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/industry" element={<Industry />} />
        <Route path="/innovation" element={<Innovation />} />
        <Route path="/products" element={<Products />} />
        <Route path="/green" element={<Green />} />
        <Route path="/news" element={<News />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
