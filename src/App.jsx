import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import AdminHomePage from './pages/admin/AdminHome'
import AdminAboutPage from './pages/admin/AdminAbout'
import AdminIndustryPage from './pages/admin/AdminIndustry'
import AdminInnovationPage from './pages/admin/AdminInnovation'
import AdminProductsPage from './pages/admin/AdminProducts'
import AdminGreenPage from './pages/admin/AdminGreen'
import AdminNewsPage from './pages/admin/AdminNews'
import AdminPartnersPage from './pages/admin/AdminPartners'
import AdminContactPage from './pages/admin/AdminContact'

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="site-config" element={<AdminSiteConfig />} />
          <Route path="home" element={<AdminHomePage />} />
          <Route path="about" element={<AdminAboutPage />} />
          <Route path="industry" element={<AdminIndustryPage />} />
          <Route path="innovation" element={<AdminInnovationPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="green" element={<AdminGreenPage />} />
          <Route path="news" element={<AdminNewsPage />} />
          <Route path="partners" element={<AdminPartnersPage />} />
          <Route path="contact" element={<AdminContactPage />} />
        </Route>
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
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
      </Routes>
    </Layout>
  )
}
