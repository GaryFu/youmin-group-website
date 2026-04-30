import { deepClone } from '../../utils/deepClone'
import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2 } from 'lucide-react'

function ProductsForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(deepClone(data))

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
            <label className="block text-sm font-medium text-gray-700 mb-1">详情内容（每行一段）</label>
            <textarea
              value={cat.detailDescription || ''}
              onChange={updateCategory(ci, 'detailDescription')}
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="详情页面的内容描述..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {cat.items?.map((item, ii) => (
              <div key={ii} className="flex items-center gap-1 bg-green-50 rounded-full pl-3 pr-1 py-1">
                <input type="text" value={item} onChange={updateItem(ci, ii)} className="w-24 text-xs bg-transparent border-none focus:outline-none text-green-700" />
                <button type="button" onClick={() => removeItem(ci, ii)} className="text-green-400 hover:text-red-500">
                  <Trash2 size={12} />
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
