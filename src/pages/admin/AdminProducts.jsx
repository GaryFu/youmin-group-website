import { deepClone } from '../../utils/deepClone'
import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2, Upload } from 'lucide-react'

function ProductsForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(deepClone(data))
  const [uploading, setUploading] = useState({}) // { productKey: true }

  const handleImageUpload = async (ci, si, pi, file) => {
    const key = `${ci}-${si}-${pi}`
    setUploading((prev) => ({ ...prev, [key]: true }))
    try {
      const reader = new FileReader()
      const base64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('youmin_admin_auth') ? JSON.parse(localStorage.getItem('youmin_admin_auth')).token : ''}` },
        body: JSON.stringify({ image: base64, filename: file.name }),
      })
      const data = await res.json()
      if (data.url) {
        setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].image = data.url; return copy })
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
    setUploading((prev) => ({ ...prev, [key]: false }))
  }

  useEffect(() => { setForm(deepClone(data)) }, [data, resetKey])

  const handleSubmit = (e) => { e.preventDefault(); onSave(form) }

  const updateField = (path) => (e) => {
    setForm((f) => {
      const keys = path.split('.')
      const copy = deepClone(f)
      let obj = copy
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = e.target.value
      return copy
    })
  }

  const updateCategory = (ci, field) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.categories[ci][field] = e.target.value
      return copy
    })
  }

  const updateItem = (ci, ii) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.categories[ci].items[ii] = e.target.value
      return copy
    })
  }

  const addItem = (ci) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.categories[ci].items.push('')
      return copy
    })
  }

  const removeItem = (ci, ii) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.categories[ci].items.splice(ii, 1)
      return copy
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">英文小标题</label>
            <input type="text" value={form.subtitle || ''} onChange={updateField('subtitle')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">中文标题</label>
            <input type="text" value={form.title || ''} onChange={updateField('title')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
      </div>

      {form.categories?.map((cat, ci) => (
        <div key={ci} className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">{cat.name || `分类 #${ci + 1}`}</h3>
            <button type="button" onClick={() => addItem(ci)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
              <Plus size={16} /> 添加子项
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <input type="text" value={cat.name} onChange={updateCategory(ci, 'name')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="分类名称" />
            <input type="text" value={cat.icon} onChange={updateCategory(ci, 'icon')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="图标代码" />
            <input type="text" value={cat.slug || ''} onChange={updateCategory(ci, 'slug')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="URL 标识 (slug)" />
            <input type="text" value={cat.desc} onChange={updateCategory(ci, 'desc')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="简述" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">详情内容（每行一段，选填）</label>
            <textarea
              value={cat.detailDescription || ''}
              onChange={updateCategory(ci, 'detailDescription')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="详情页面的内容描述..."
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {cat.items?.map((item, ii) => (
              <div key={ii} className="flex items-center gap-1 bg-green-50 rounded-full pl-3 pr-1 py-1">
                <input type="text" value={item} onChange={updateItem(ci, ii)} className="w-24 text-xs bg-transparent border-none focus:outline-none text-green-700" />
                <button type="button" onClick={() => removeItem(ci, ii)} className="text-green-400 hover:text-red-500">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Sub-Categories */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">产品子分类（产品目录）</h4>
              <button
                type="button"
                onClick={() => {
                  setForm((f) => {
                    const copy = deepClone(f)
                    if (!copy.categories[ci].subCategories) copy.categories[ci].subCategories = []
                    copy.categories[ci].subCategories.push({ name: '', products: [] })
                    return copy
                  })
                }}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
              >
                <Plus size={14} /> 添加子分类
              </button>
            </div>
            {(cat.subCategories || []).map((sub, si) => (
              <div key={si} className="bg-gray-50 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={sub.name}
                    onChange={(e) => {
                      setForm((f) => {
                        const copy = deepClone(f)
                        copy.categories[ci].subCategories[si].name = e.target.value
                        return copy
                      })
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="子分类名称"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => {
                        const copy = deepClone(f)
                        copy.categories[ci].subCategories.splice(si, 1)
                        return copy
                      })
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {(sub.products || []).map((prod, pi) => (
                  <div key={pi} className="ml-2 mb-2 bg-white rounded-lg border border-gray-100 p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <input
                        type="text"
                        value={prod.name}
                        onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].name = e.target.value; return copy; })}}
                        className="w-24 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="产品名"
                      />
                      <input
                        type="text"
                        value={prod.slug || ''}
                        onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].slug = e.target.value; return copy; })}}
                        className="w-20 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="slug"
                      />
                      <input
                        type="text"
                        value={prod.tagline || ''}
                        onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].tagline = e.target.value; return copy; })}}
                        className="w-28 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="标语"
                      />
                      <input
                        type="text"
                        value={prod.url || ''}
                        onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].url = e.target.value; return copy; })}}
                        className="w-32 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="微信链接"
                      />
                    </div>
                    <input
                      type="text"
                      value={prod.desc || ''}
                      onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].desc = e.target.value; return copy; })}}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                      placeholder="详细描述"
                    />
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="text"
                        value={prod.image || ''}
                        onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].image = e.target.value; return copy; })}}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="产品图片 URL"
                      />
                      <label className="shrink-0 cursor-pointer px-2 py-1 bg-gray-100 hover:bg-green-50 rounded text-xs text-gray-500 hover:text-green-600 transition-colors flex items-center gap-1">
                        <Upload size={12} />
                        {uploading[`${ci}-${si}-${pi}`] ? '...' : '上传'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(ci, si, pi, file)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>

                    {/* Features */}
                    <div className="mt-2 border-t border-gray-100 pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">产品特性</span>
                        <button
                          type="button"
                          onClick={() => { setForm((f) => { const copy = deepClone(f); if (!copy.categories[ci].subCategories[si].products[pi].features) copy.categories[ci].subCategories[si].products[pi].features = []; copy.categories[ci].subCategories[si].products[pi].features.push({ icon: 'CheckCircle2', text: '' }); return copy; })}}
                          className="text-[10px] text-green-500 hover:text-green-600"
                        >
                          + 添加
                        </button>
                      </div>
                      {(prod.features || []).map((feat, fi) => (
                        <div key={fi} className="flex items-center gap-1 mb-0.5">
                          <select
                            value={feat.icon || 'CheckCircle2'}
                            onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].features[fi].icon = e.target.value; return copy; })}}
                            className="w-20 px-1 py-0.5 border border-gray-200 rounded text-[10px] focus:outline-none"
                          >
                            <option value="Award">🏆 Award</option>
                            <option value="Zap">⚡ Zap</option>
                            <option value="Shield">🛡️ Shield</option>
                            <option value="Star">⭐ Star</option>
                            <option value="TrendingUp">📈 Up</option>
                            <option value="CheckCircle2">✅ Check</option>
                            <option value="Package">📦 Package</option>
                            <option value="Beaker">🧪 Beaker</option>
                            <option value="Leaf">🌿 Leaf</option>
                          </select>
                          <input
                            type="text"
                            value={feat.text}
                            onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].features[fi].text = e.target.value; return copy; })}}
                            className="flex-1 px-1 py-0.5 border border-gray-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="特性描述"
                          />
                          <button type="button" onClick={() => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].features.splice(fi, 1); return copy; })}}
                            className="text-red-300 hover:text-red-500 shrink-0"><Trash2 size={10} /></button>
                        </div>
                      ))}
                    </div>

                    {/* Specs */}
                    <div className="mt-2 border-t border-gray-100 pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">技术规格</span>
                        <button
                          type="button"
                          onClick={() => { setForm((f) => { const copy = deepClone(f); if (!copy.categories[ci].subCategories[si].products[pi].specs) copy.categories[ci].subCategories[si].products[pi].specs = []; copy.categories[ci].subCategories[si].products[pi].specs.push({ label: '', value: '' }); return copy; })}}
                          className="text-[10px] text-green-500 hover:text-green-600"
                        >
                          + 添加
                        </button>
                      </div>
                      {(prod.specs || []).map((spec, si) => (
                        <div key={si} className="flex items-center gap-1 mb-0.5">
                          <input
                            type="text"
                            value={spec.label}
                            onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].specs[si].label = e.target.value; return copy; })}}
                            className="w-20 px-1 py-0.5 border border-gray-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="规格名"
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].specs[si].value = e.target.value; return copy; })}}
                            className="flex-1 px-1 py-0.5 border border-gray-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="规格值"
                          />
                          <button type="button" onClick={() => { setForm((f) => { const copy = deepClone(f); copy.categories[ci].subCategories[si].products[pi].specs.splice(si, 1); return copy; })}}
                            className="text-red-300 hover:text-red-500 shrink-0"><Trash2 size={10} /></button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => {
                            const copy = deepClone(f)
                            copy.categories[ci].subCategories[si].products.splice(pi, 1)
                            return copy
                          })
                        }}
                        className="text-red-300 hover:text-red-500 text-xs"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setForm((f) => {
                      const copy = deepClone(f)
                      if (!copy.categories[ci].subCategories[si].products) copy.categories[ci].subCategories[si].products = []
                      copy.categories[ci].subCategories[si].products.push({ name: '', slug: '', tagline: '', desc: '', url: '', image: '', features: [], specs: [] })
                      return copy
                    })
                  }}
                  className="flex items-center gap-1 text-xs text-green-500 hover:text-green-600 mt-1 ml-2"
                >
                  <Plus size={12} /> 添加产品
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button type="submit" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
        保存修改
      </button>
    </form>
  )
}

export default function AdminProducts() {
  return (
    <EditorShell
      contentKey="products"
      title="产品与服务"
      subtitle="产品分类及服务项目管理"
      renderForm={(props) => <ProductsForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
