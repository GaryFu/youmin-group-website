import { deepClone } from '../../utils/deepClone'
import { useState, useEffect, useMemo } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Search, X, Plus, Trash2, Upload, Edit3, Package, ChevronDown, ChevronUp } from 'lucide-react'

function ProductEditor({ product, categoryName, subCategoryName, onSave, onCancel }) {
  const [form, setForm] = useState(deepClone(product))
  const [uploading, setUploading] = useState(false)
  const [showFeatures, setShowFeatures] = useState(true)
  const [showSpecs, setShowSpecs] = useState(true)

  useEffect(() => { setForm(deepClone(product)) }, [product])

  const handleImageUpload = async (file) => {
    setUploading(true)
    try {
      const reader = new FileReader()
      const base64 = await new Promise((resolve) => { reader.onload = () => resolve(reader.result); reader.readAsDataURL(file) })
      const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify({ image: base64, filename: file.name }),
      })
      const data = await res.json()
      if (data.url) setForm((f) => ({ ...f, image: data.url }))
    } catch (err) { console.error('Upload failed:', err) }
    setUploading(false)
  }

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }))
  const setFeature = (i, field, value) => setForm((f) => { const feat = [...(f.features || [])]; feat[i] = { ...feat[i], [field]: value }; return { ...f, features: feat } })
  const addFeature = () => setForm((f) => ({ ...f, features: [...(f.features || []), { icon: 'CheckCircle2', text: '' }] }))
  const removeFeature = (i) => setForm((f) => ({ ...f, features: (f.features || []).filter((_, j) => j !== i) }))
  const setSpec = (i, field, value) => setForm((f) => { const specs = [...(f.specs || [])]; specs[i] = { ...specs[i], [field]: value }; return { ...f, specs } })
  const addSpec = () => setForm((f) => ({ ...f, specs: [...(f.specs || []), { label: '', value: '' }] }))
  const removeSpec = (i) => setForm((f) => ({ ...f, specs: (f.specs || []).filter((_, j) => j !== i) }))

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-gray-900">{product.name || '新产品'}</h3>
            <p className="text-xs text-gray-400">{categoryName} · {subCategoryName}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Basic */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">产品名</label>
            <input type="text" value={form.name || ''} onChange={(e) => setField('name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
              <input type="text" value={form.slug || ''} onChange={(e) => setField('slug', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">标语</label>
              <input type="text" value={form.tagline || ''} onChange={(e) => setField('tagline', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">详细描述</label>
            <textarea value={form.desc || ''} onChange={(e) => setField('desc', e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">产品图片</label>
            <div className="flex gap-2">
              <input type="text" value={form.image || ''} onChange={(e) => setField('image', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="图片 URL" />
              <label className="shrink-0 cursor-pointer px-3 py-2 bg-gray-100 hover:bg-green-50 rounded-lg text-sm text-gray-500 hover:text-green-600 transition-colors flex items-center gap-1">
                <Upload size={14} /> {uploading ? '...' : '上传'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = '' }} />
              </label>
            </div>
            {form.image && <img src={form.image} alt="" className="mt-2 h-24 rounded-lg object-cover" />}
          </div>

          {/* Features */}
          <div>
            <button type="button" onClick={() => setShowFeatures(!showFeatures)} className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2">
              {showFeatures ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              产品特性 ({(form.features || []).length})
            </button>
            {showFeatures && (
              <div className="space-y-2">
                {(form.features || []).map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select value={feat.icon || 'CheckCircle2'} onChange={(e) => setFeature(i, 'icon', e.target.value)} className="w-20 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none">
                      <option value="Award">🏆 Award</option><option value="Zap">⚡ Zap</option><option value="Shield">🛡️ Shield</option><option value="Star">⭐ Star</option><option value="TrendingUp">📈 Up</option><option value="CheckCircle2">✅ Check</option>
                    </select>
                    <input type="text" value={feat.text} onChange={(e) => setFeature(i, 'text', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500" placeholder="特性描述" />
                    <button onClick={() => removeFeature(i)} className="text-red-300 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
                <button onClick={addFeature} className="text-xs text-green-600 hover:text-green-700"><Plus size={12} /> 添加特性</button>
              </div>
            )}
          </div>

          {/* Specs */}
          <div>
            <button type="button" onClick={() => setShowSpecs(!showSpecs)} className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2">
              {showSpecs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              技术规格 ({(form.specs || []).length})
            </button>
            {showSpecs && (
              <div className="space-y-2">
                {(form.specs || []).map((spec, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={spec.label} onChange={(e) => setSpec(i, 'label', e.target.value)} className="w-24 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="规格名" />
                    <input type="text" value={spec.value} onChange={(e) => setSpec(i, 'value', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="规格值" />
                    <button onClick={() => removeSpec(i)} className="text-red-300 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
                <button onClick={addSpec} className="text-xs text-green-600 hover:text-green-700"><Plus size={12} /> 添加规格</button>
              </div>
            )}
          </div>

          {/* WeChat link */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">微信公众号链接</label>
            <input type="text" value={form.url || ''} onChange={(e) => setField('url', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="https://mp.weixin.qq.com/s/..." />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => onSave(form)} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors">保存</button>
            <button onClick={onCancel} className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductList({ data, onSave, resetKey }) {
  const [form, setForm] = useState(deepClone(data))
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [editing, setEditing] = useState(null) // { catIdx, subIdx, prodIdx }

  useEffect(() => { setForm(deepClone(data)) }, [data, resetKey])

  // Flatten all products with their category context
  const allProducts = useMemo(() => {
    const list = []
    for (let ci = 0; ci < (form.categories || []).length; ci++) {
      const cat = form.categories[ci]
      for (let si = 0; si < (cat.subCategories || []).length; si++) {
        const sub = cat.subCategories[si]
        for (let pi = 0; pi < (sub.products || []).length; pi++) {
          list.push({
            ...sub.products[pi],
            _ci: ci, _si: si, _pi: pi,
            _catName: cat.name,
            _subName: sub.name,
          })
        }
      }
    }
    return list
  }, [form])

  // Filter
  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (search && !p.name.includes(search) && !(p.tagline || '').includes(search)) return false
      if (filterCat !== 'all' && p._ci !== parseInt(filterCat)) return false
      return true
    })
  }, [allProducts, search, filterCat])

  const handleProductSave = (updatedProduct) => {
    const { _ci, _si, _pi, ...product } = updatedProduct
    setForm((f) => {
      const copy = deepClone(f)
      copy.categories[_ci].subCategories[_si].products[_pi] = product
      return copy
    })
    setEditing(null)
  }

  const handleSaveAll = () => {
    onSave(form)
  }

  const openEditor = (product) => {
    setEditing(product)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`搜索 ${allProducts.length} 个产品...`}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">全部分类</option>
          {(form.categories || []).map((cat, i) => <option key={i} value={i}>{cat.name}</option>)}
        </select>
        <button onClick={handleSaveAll} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">保存全部</button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">没有找到产品</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((product, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={18} /></div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 truncate">{product.tagline || product.desc?.slice(0, 40)}</p>
                </div>
                {/* Category */}
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded shrink-0">{product._catName} · {product._subName}</span>
                {/* Edit button */}
                <button onClick={() => openEditor(product)} className="shrink-0 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Edit3 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-xs text-gray-400">
        共 {filtered.length} 个产品 {filtered.length !== allProducts.length ? `(筛选自 ${allProducts.length} 个)` : ''}
      </div>

      {/* Slide-out Editor */}
      {editing && (
        <ProductEditor
          product={editing}
          categoryName={editing._catName}
          subCategoryName={editing._subName}
          onSave={handleProductSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}

export default function AdminProducts() {
  return (
    <EditorShell
      contentKey="products"
      title="产品管理"
      subtitle="搜索、筛选和编辑所有产品"
      renderForm={(props) => <ProductList {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
