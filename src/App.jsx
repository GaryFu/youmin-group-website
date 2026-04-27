import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Industry from './pages/Industry'
import Innovation from './pages/Innovation'
import Products from './pages/Products'
import Green from './pages/Green'
import News from './pages/News'
import Partners from './pages/Partners'
import Contact from './pages/Contact'

export default function App() {
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
      </Routes>
    </Layout>
  )
}
