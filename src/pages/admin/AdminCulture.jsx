import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { deepClone } from '../../utils/deepClone'
import EditorShell from '../../components/admin/EditorShell'

function CultureForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(() => deepClone(data))

  useEffect(() => {
    setForm(deepClone(data))
  }, [data, resetKey])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  const updateField = (path) => (e) => {
    setForm((prev) => {
      const next = deepClone(prev)
      const keys = path.split('.')
      let node = next
      for (let i = 0; i < keys.length - 1; i++) node = node[keys[i]]
      node[keys[keys.length - 1]] = e.target.value
      return next
    })
  }

  const updateItem = (index, field) => (e) => {
    setForm((prev) => {
      const next = deepClone(prev)
      next.items[index][field] = e.target.value
      return next
    })
  }

  const addItem = () => {
    setForm((prev) => {
      const next = deepClone(prev)
      next.items.push({ label: '', value: '' })
      return next
    })
  }

  const removeItem = (index) => {
    setForm((prev) => {
      const next = deepClone(prev)
      next.items.splice(index, 1)
      return next
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">页面基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">页面标题</label>
            <input
              type="text"
              value={form.title}
              onChange={updateField('title')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">英文副标题</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={updateField('subtitle')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Culture Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">企业文化条目</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
          >
            <Plus size={16} /> 添加条目
          </button>
        </div>
        <div className="space-y-3">
          {form.items.map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <input
                type="text"
                value={item.label}
                onChange={updateItem(i, 'label')}
                placeholder="名称"
                className="w-40 shrink-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="text"
                value={item.value}
                onChange={updateItem(i, 'value')}
                placeholder="内容"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Motto */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">底部座右铭</h3>
        <input
          type="text"
          value={form.motto}
          onChange={updateField('motto')}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="座右铭..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
      >
        保存修改
      </button>
    </form>
  )
}

export default function AdminCulture() {
  return (
    <EditorShell
      contentKey="culture"
      title="企业文化"
      subtitle="页面信息、文化条目、座右铭"
      renderForm={(props) => <CultureForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
