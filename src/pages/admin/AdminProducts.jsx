import { useState, useEffect, useCallback } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import Toast from '../../components/admin/Toast'
import { Search, X, Plus, Trash2, Upload, Edit3, Package, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, PlusCircle, Rocket, Check } from 'lucide-react'

const PAGE_SIZE = 20

function ProductEditor({ product, subcategories, onSave, onCancel }) {
  const [form, setForm] = useState({ ...product })
  const [uploading, setUploading] = useState(-1)
  const [showFeatures, setShowFeatures] = useState(true)
  const [showSpecs, setShowSpecs] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { setForm({ ...product }) }, [product])

  const handleImageUpload = async (file, slotIndex) => {
    setUploading(slotIndex)
    try {
      // Compress large images client-side before upload
      let blob = file
      if (file.size > 500 * 1024) { // >500KB, compress via canvas
        blob = await new Promise((resolve) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const scale = Math.min(1, 1600 / Math.max(img.width, img.height))
            canvas.width = img.width * scale
            canvas.height = img.height * scale
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            canvas.toBlob((b) => resolve(b || file), 'image/jpeg', 0.75)
          }
          img.src = URL.createObjectURL(file)
        })
      }
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      // Sanitize filename: keep only ASCII, numbers, dots, dashes, underscores
      const ext = file.name.split('.').pop() || 'jpg'
      const safeName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
      const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify({ image: base64, filename: safeName }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || '上传失败')
      if (!d.url) throw new Error('服务器未返回图片地址')
      setForm((f) => {
        const imgs = [...(f.images || (f.image ? [f.image] : []))]
        imgs[slotIndex] = d.url
        return { ...f, images: imgs, image: imgs[0] || null }
      })
    } catch (err) {
      setError('图片上传失败: ' + err.message); setTimeout(() => setError(null), 3000)
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
        {error && <div className="fixed top-4 right-4 z-[100] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg text-sm">{error}</div>}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-gray-900">{form.name || '新产品'}</h3>
            <p className="text-xs text-gray-400">{form.cat_name} · {form.sub_name}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-900">
            <div className="flex items-start gap-2">
              <Rocket size={16} className="mt-0.5 shrink-0 text-gold-600" />
              <div>
                <p className="font-semibold">保存后还需要手动发布</p>
                <p className="mt-0.5 text-xs leading-5 text-gold-800">这里保存的是数据库内容，前台网站要点击列表页的「发布到网站」后才会更新。</p>
              </div>
            </div>
          </div>
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
            <button onClick={() => onSave(form)} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700">保存到数据库</button>
            <button onClick={onCancel} className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryManager({ onRefresh }) {
  const [cats, setCats] = useState([])
  const [subs, setSubs] = useState([])
  const [open, setOpen] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', slug: '', icon: 'Package', desc: '' })
  const [newSub, setNewSub] = useState({ name: '', category_id: '' })
  const [editingCat, setEditingCat] = useState(null)
  const [editingSub, setEditingSub] = useState(null)
  const [err, setErr] = useState('')

  const api = async (path, method = 'GET', body) => {
    const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
    const opts = { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` } }
    if (body) opts.body = JSON.stringify(body)
    const res = await fetch(`/api/products${path}`, opts)
    if (!res.ok) throw new Error((await res.json()).error || 'failed')
    return res.json()
  }

  const load = async () => {
    const c = await api('/categories')
    const s = await fetch('/api/products/subcategories').then(r => r.json())
    setCats(Array.isArray(c) ? c : (c.categories || []))
    setSubs(Array.isArray(s) ? s : [])
  }
  useEffect(() => { load() }, [])

  const addCat = async () => { try { await api('/categories', 'POST', newCat); setNewCat({ name: '', slug: '', icon: 'Package', desc: '' }); load(); onRefresh() } catch (e) { setErr(e.message) } }
  const startEditCat = (cat) => setEditingCat({ id: cat.id, name: cat.name || '', slug: cat.slug || '' })
  const saveCat = async () => {
    if (!editingCat?.name?.trim() || !editingCat?.slug?.trim()) { setErr('分类名称和 slug 不能为空'); return }
    try {
      await api('/categories/' + editingCat.id, 'PUT', { name: editingCat.name.trim(), slug: editingCat.slug.trim() })
      setEditingCat(null); load(); onRefresh()
    } catch (e) { setErr(e.message) }
  }
  const delCat = async (id) => { if (confirm('删除分类将同时删除其下子分类和产品，确定？')) { try { await api('/categories/' + id, 'DELETE'); load(); onRefresh() } catch (e) { setErr(e.message) } } }
  const moveCat = async (idx, dir) => {
    if (idx + dir < 0 || idx + dir >= cats.length) return
    const a = cats[idx], b = cats[idx + dir]
    await api('/categories/' + a.id, 'PUT', { sort_order: b.sort_order })
    await api('/categories/' + b.id, 'PUT', { sort_order: a.sort_order })
    load(); onRefresh()
  }
  const addSub = async () => { try { await api('/subcategories', 'POST', newSub); setNewSub({ name: '', category_id: '' }); load(); onRefresh() } catch (e) { setErr(e.message) } }
  const startEditSub = (sub) => setEditingSub({ id: sub.id, name: sub.name || '', category_id: String(sub.category_id || '') })
  const saveSub = async () => {
    if (!editingSub?.name?.trim() || !editingSub?.category_id) { setErr('子分类名称和所属分类不能为空'); return }
    try {
      await api('/subcategories/' + editingSub.id, 'PUT', { name: editingSub.name.trim(), category_id: editingSub.category_id })
      setEditingSub(null); load(); onRefresh()
    } catch (e) { setErr(e.message) }
  }
  const delSub = async (id) => { if (confirm('删除子分类将同时删除其下产品，确定？')) { try { await api('/subcategories/' + id, 'DELETE'); load(); onRefresh() } catch (e) { setErr(e.message) } } }
  const moveSub = async (idx, dir) => {
    if (idx + dir < 0 || idx + dir >= subs.length) return
    const a = subs[idx], b = subs[idx + dir]
    await api('/subcategories/' + a.id, 'PUT', { sort_order: b.sort_order, category_id: a.category_id, name: a.name })
    await api('/subcategories/' + b.id, 'PUT', { sort_order: a.sort_order, category_id: b.category_id, name: b.name })
    load(); onRefresh()
  }

  if (!open) return <button onClick={() => setOpen(true)} className="text-sm text-green-600 hover:text-green-700 mb-4 flex items-center gap-1"><PlusCircle size={14} /> 管理分类</button>

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      {err && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs mb-3">{err} <button onClick={() => setErr('')} className="ml-2 underline">关闭</button></div>}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">分类管理</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      {/* Categories */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-500 mb-2">产品分类</h4>
        <div className="flex gap-2 mb-2">
          <input value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} placeholder="名称" className="flex-1 px-2 py-1.5 border rounded text-xs" />
          <input value={newCat.slug} onChange={e => setNewCat(p => ({ ...p, slug: e.target.value }))} placeholder="slug" className="w-24 px-2 py-1.5 border rounded text-xs" />
          <button onClick={addCat} className="px-3 py-1.5 bg-green-600 text-white rounded text-xs">添加</button>
        </div>
        {cats.map((c, i) => (
          <div key={c.id} className="flex items-center gap-1 py-1 text-sm">
            <div className="flex flex-col gap-0 mr-1">
              <button onClick={() => moveCat(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none"><ChevronUp size={12} /></button>
              <button onClick={() => moveCat(i, 1)} disabled={i === cats.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none"><ChevronDown size={12} /></button>
            </div>
            {editingCat?.id === c.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  value={editingCat.name}
                  onChange={e => setEditingCat(p => ({ ...p, name: e.target.value }))}
                  className="min-w-0 flex-1 px-2 py-1.5 border border-green-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <input
                  value={editingCat.slug}
                  onChange={e => setEditingCat(p => ({ ...p, slug: e.target.value }))}
                  className="w-40 px-2 py-1.5 border border-green-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="slug"
                />
              </div>
            ) : (
              <span className="flex-1 text-gray-700">{c.name} <span className="text-gray-400 text-xs">({c.slug})</span></span>
            )}
            {editingCat?.id === c.id ? (
              <>
                <button onClick={saveCat} className="text-green-600 hover:text-green-700" aria-label="保存分类"><Check size={14} /></button>
                <button onClick={() => setEditingCat(null)} className="text-gray-400 hover:text-gray-600" aria-label="取消编辑"><X size={14} /></button>
              </>
            ) : (
              <button onClick={() => startEditCat(c)} className="text-gray-400 hover:text-green-600" aria-label="编辑分类"><Edit3 size={12} /></button>
            )}
            <button onClick={() => delCat(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
          </div>
        ))}
      </div>
      {/* Subcategories */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 mb-2">产品子分类</h4>
        <div className="flex gap-2 mb-2">
          <input value={newSub.name} onChange={e => setNewSub(p => ({ ...p, name: e.target.value }))} placeholder="名称" className="flex-1 px-2 py-1.5 border rounded text-xs" />
          <select value={newSub.category_id} onChange={e => setNewSub(p => ({ ...p, category_id: e.target.value }))} className="w-32 px-2 py-1.5 border rounded text-xs">
            <option value="">选择分类</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={addSub} className="px-3 py-1.5 bg-green-600 text-white rounded text-xs">添加</button>
        </div>
        {subs.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 py-1 text-sm">
            <div className="flex flex-col gap-0 mr-1">
              <button onClick={() => moveSub(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none"><ChevronUp size={12} /></button>
              <button onClick={() => moveSub(i, 1)} disabled={i === subs.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none"><ChevronDown size={12} /></button>
            </div>
            {editingSub?.id === s.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  value={editingSub.name}
                  onChange={e => setEditingSub(p => ({ ...p, name: e.target.value }))}
                  className="min-w-0 flex-1 px-2 py-1.5 border border-green-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <select
                  value={editingSub.category_id}
                  onChange={e => setEditingSub(p => ({ ...p, category_id: e.target.value }))}
                  className="w-40 px-2 py-1.5 border border-green-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            ) : (
              <span className="flex-1 text-gray-700">{s.name} <span className="text-gray-400 text-xs">({s.cat_name})</span></span>
            )}
            {editingSub?.id === s.id ? (
              <>
                <button onClick={saveSub} className="text-green-600 hover:text-green-700" aria-label="保存子分类"><Check size={14} /></button>
                <button onClick={() => setEditingSub(null)} className="text-gray-400 hover:text-gray-600" aria-label="取消编辑"><X size={14} /></button>
              </>
            ) : (
              <button onClick={() => startEditSub(s)} className="text-gray-400 hover:text-green-600" aria-label="编辑子分类"><Edit3 size={12} /></button>
            )}
            <button onClick={() => delSub(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
          </div>
        ))}
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
      setToast({ message: '加载产品失败: ' + err.message, type: 'error' })
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
      setToast({
        title: isNew ? '产品创建成功' : '产品保存成功',
        message: '内容已保存到数据库。请点击「发布到网站」，前台页面才会更新。',
        type: 'success',
      })
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
    setToast({
      title: res.ok ? '发布已触发' : '发布失败',
      message: d.message || d.error || '操作完成',
      type: res.ok ? 'success' : 'error',
    })
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
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <CategoryManager onRefresh={() => { fetchProducts(page, search, filterCat); fetch('/api/products/subcategories').then(r => r.json()).then(setSubcategories).catch(() => {}) }} />

      <div className="mb-5 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-900 shadow-sm">
        <div className="flex items-start gap-2">
          <Rocket size={17} className="mt-0.5 shrink-0 text-gold-600" />
          <div>
            <p className="font-semibold">产品修改后必须手动发布</p>
            <p className="mt-0.5 text-xs leading-5 text-gold-800">保存会立即写入后管数据库；公开网站使用静态内容，需要点击「发布到网站」触发部署后生效。</p>
          </div>
        </div>
      </div>

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
