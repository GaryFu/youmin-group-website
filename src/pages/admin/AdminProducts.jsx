import { useState, useEffect, useCallback } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import Toast from '../../components/admin/Toast'
import { Search, X, Plus, Trash2, Upload, Edit3, Package, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, PlusCircle, Rocket } from 'lucide-react'

const PAGE_SIZE = 20

function ProductEditor({ product, subcategories, onSave, onCancel }) {
  const [form, setForm] = useState({ ...product })
  const [uploading, setUploading] = useState(-1) // index of uploading slot, -1 = none
  const [showFeatures, setShowFeatures] = useState(true)
  const [showSpecs, setShowSpecs] = useState(true)

  useEffect(() => { setForm({ ...product }) }, [product])

  const handleImageUpload = async (file, slotIndex) => {
    setUploading(slotIndex)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const safeName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
      // Upload directly to Supabase Storage (bypass Vercel 4.5MB limit)
      const supabaseUrl = 'https://tkkmksnzqmfaljimooac.supabase.co'
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRra21rc256cW1mYWxqaW1vb2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTU5MTUsImV4cCI6MjA5Mjg3MTkxNX0.pcJaTkWHDQFOehmrM5rAIDX4PKi2Phb0Ri2kAF7Y7PM'
      const res = await fetch(`${supabaseUrl}/storage/v1/object/products/${safeName}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${anonKey}` },
        body: file,
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || errData.error || `上传失败 (${res.status})`)
      }
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/products/${safeName}`
      setForm((f) => {
        const imgs = [...(f.images || (f.image ? [f.image] : []))]
        imgs[slotIndex] = publicUrl
        return { ...f, images: imgs, image: imgs[0] || null }
      })
    } catch (err) {
      alert('图片上传失败: ' + err.message)
    }
    setUploading(-1)
  }

  const setField = (f, v) => setForm((p) => ({ ...p, [f]: v }))
  const setFeature = (i, f, v) => setForm((p) => { const arr = [...(p.features || [])]; arr[i] = { ...arr[i], [f]: v }; return { ...p, features: arr } })
  const addFeature = () => setForm((p) => ({ ...p, features: [...(p.features || []), { icon: 'CheckCircle2', text: '' }] }))
  const removeFeature = (i) => setForm((p) => ({ ...p, features: (p.features || []).filter((_, j) => j !== i) }))
  const setSpec = (i, f, v) => setForm((p) => { const arr = [...(p.specs || [])]; arr[i] = { ...arr[i], [f]: v }; return { ...p, specs: arr } })
  const addSpec = () => setForm((p) => ({ ...p, specs: [...(p.specs || []), { label: '', value: '' }] }))
  const removeSpec = (i) => setForm((p) => ({ ...p, specs: (p.specs || []).filter((_, j) => j !== i) }))

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-gray-900">{form.name || '新产品'}</h3>
            <p className="text-xs text-gray-400">{form.cat_name} · {form.sub_name}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          {!form.id && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">所属子分类</label>
              <select
                value={form.subcategory_id || ''}
                onChange={(e) => setField('subcategory_id', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">请选择</option>
                {(subcategories || []).map((s) => (
                  <option key={s.id} value={s.id}>{s.cat_name} · {s.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">产品名</label>
            <input type="text" value={form.name || ''} onChange={(e) => setField('name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">标语</label><input type="text" value={form.tagline || ''} onChange={(e) => setField('tagline', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">详细描述</label><textarea value={form.desc || ''} onChange={(e) => setField('desc', e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">产品图片（多张）</label>
            {(form.images || (form.image ? [form.image] : [])).map((img, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={img} onChange={(e) => { const imgs = [...(form.images || (form.image ? [form.image] : []))]; imgs[i] = e.target.value; setField('images', imgs) }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500" placeholder={`图片 ${i + 1} URL`} />
                <label className={`cursor-pointer px-2 py-1 rounded text-xs flex items-center ${uploading === i ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-green-50 text-gray-500 hover:text-green-600'}`}><Upload size={12} />{uploading === i ? '...' : ''}<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, i); e.target.value = '' }} /></label>
                <button onClick={() => { const imgs = [...(form.images || (form.image ? [form.image] : []))]; imgs.splice(i, 1); setField('images', imgs) }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => { const imgs = [...(form.images || (form.image ? [form.image] : []))]; imgs.push(''); setField('images', imgs) }} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"><Plus size={12} /> 添加图片</button>
            {form.images && form.images.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {form.images.map((img, i) => img && <img key={i} src={img} alt="" className="h-16 rounded-lg object-contain border border-gray-100" />)}
              </div>
            )}
          </div>
          <div>
            <button type="button" onClick={() => setShowFeatures(!showFeatures)} className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2">{showFeatures ? <ChevronUp size={14} /> : <ChevronDown size={14} />}产品特性 ({(form.features || []).length})</button>
            {showFeatures && (
              <div className="space-y-2">
                {(form.features || []).map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select value={feat.icon || 'CheckCircle2'} onChange={(e) => setFeature(i, 'icon', e.target.value)} className="w-20 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none"><option value="Award">🏆</option><option value="Zap">⚡</option><option value="Shield">🛡️</option><option value="Star">⭐</option><option value="TrendingUp">📈</option><option value="CheckCircle2">✅</option></select>
                    <input type="text" value={feat.text} onChange={(e) => setFeature(i, 'text', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500" placeholder="特性" />
                    <button onClick={() => removeFeature(i)} className="text-red-300 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
                <button onClick={addFeature} className="text-xs text-green-600 hover:text-green-700"><Plus size={12} /> 添加特性</button>
              </div>
            )}
          </div>
          <div>
            <button type="button" onClick={() => setShowSpecs(!showSpecs)} className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2">{showSpecs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}技术规格 ({(form.specs || []).length})</button>
            {showSpecs && (
              <div className="space-y-2">
                {(form.specs || []).map((spec, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={spec.label} onChange={(e) => setSpec(i, 'label', e.target.value)} className="w-24 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="名称" />
                    <input type="text" value={spec.value} onChange={(e) => setSpec(i, 'value', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="值" />
                    <button onClick={() => removeSpec(i)} className="text-red-300 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
                <button onClick={addSpec} className="text-xs text-green-600 hover:text-green-700"><Plus size={12} /> 添加规格</button>
              </div>
            )}
          </div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">微信链接</label><input type="text" value={form.url || ''} onChange={(e) => setField('url', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => onSave(form)} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700">保存</button>
            <button onClick={onCancel} className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductList() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchProducts = useCallback(async (p, s, cat) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) })
      if (s) params.set('search', s)
      if (cat && cat !== 'all') params.set('category', cat)
      const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
      const res = await fetch(`/api/products?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (res.ok) {
        setProducts(data.products)
        setCategories(data.categories)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        setPage(data.page)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts(page, search, filterCat) }, [page])
  useEffect(() => {
    fetch('/api/products/subcategories').then(r => r.json()).then(setSubcategories).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchProducts(1, search, filterCat)
  }

  const handleFilterChange = (cat) => {
    setFilterCat(cat)
    setPage(1)
    fetchProducts(1, search, cat)
  }

  const handleProductSave = async (formData) => {
    const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` }
    const isNew = !formData.id
    const res = await fetch(isNew ? '/api/products' : `/api/products/${formData.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers,
      body: JSON.stringify(formData),
    })
    if (res.ok) {
      setEditing(null)
      setToast({ message: isNew ? '创建成功' : '保存成功', type: 'success' })
      fetchProducts(page, search, filterCat)
    } else {
      const d = await res.json()
      setToast({ message: d.error || '保存失败', type: 'error' })
    }
  }

  const handlePublish = async () => {
    if (!confirm('确定要发布更改到网站吗？这将触发 Vercel 重新部署，约 1 分钟后生效。')) return
    const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
    const res = await fetch('/api/products/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
    })
    const d = await res.json()
    setToast({ message: d.message || d.error || '操作完成', type: res.ok ? 'success' : 'error' })
  }

  const handleDelete = async (product) => {
    if (!confirm(`确定删除「${product.name}」吗？此操作不可撤销。`)) return
    const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token || ''}` },
    })
    if (res.ok) {
      setToast({ message: '已删除', type: 'success' })
      fetchProducts(page, search, filterCat)
    } else {
      setToast({ message: '删除失败', type: 'error' })
    }
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`搜索产品...`} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </form>
        <select value={filterCat} onChange={(e) => handleFilterChange(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">全部分类</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="text-xs text-gray-400">共 {total} 个产品</span>
        <button onClick={handlePublish} className="px-4 py-2 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors flex items-center gap-1.5">
          <Rocket size={16} /> 发布到网站
        </button>
        <button
          onClick={() => setEditing({ name: '', tagline: '', desc: '', image: '', url: '', features: [], specs: [], cat_name: '', sub_name: '', subcategory_id: '' })}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5"
        >
          <PlusCircle size={16} /> 新增产品
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">没有找到产品</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                  {product.images?.[0] || product.image ? <img src={product.images?.[0] || product.image} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={18} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 truncate">{product.tagline || product.desc?.slice(0, 40)}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded shrink-0">{product.cat_name} · {product.sub_name}</span>
                <button onClick={async () => {
                  const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
                  const res = await fetch(`/api/products/${product.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                  if (res.ok) setEditing(await res.json())
                  else setEditing(product)
                }} className="shrink-0 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(product)} className="shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={() => fetchProducts(page - 1, search, filterCat)} disabled={page <= 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={18} /></button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let p
            if (totalPages <= 7) { p = i + 1 } else if (page <= 4) { p = i + 1 } else if (page >= totalPages - 3) { p = totalPages - 6 + i } else { p = page - 3 + i }
            return <button key={p} onClick={() => fetchProducts(p, search, filterCat)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-green-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
          })}
          <button onClick={() => fetchProducts(page + 1, search, filterCat)} disabled={page >= totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
      )}

      {editing && (
        <ProductEditor product={editing} subcategories={subcategories} onSave={handleProductSave} onCancel={() => setEditing(null)} />
      )}
    </div>
  )
}

export default function AdminProducts() {
  return (
    <EditorShell
      contentKey="products"
      title="产品（服务）管理"
      subtitle="搜索、筛选和编辑所有产品"
      renderForm={() => <ProductList />}
      onDataExtract={(data) => data}
    />
  )
}
