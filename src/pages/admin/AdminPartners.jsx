import { deepClone } from '../../utils/deepClone'
import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2 } from 'lucide-react'

function PartnersForm({ data, onSave, resetKey }) {
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

  const updateCatName = (i) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.categories[i].name = e.target.value
      return copy
    })
  }

  const updatePartner = (ci, pi) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.categories[ci].partners[pi] = e.target.value
      return copy
    })
  }

  const addPartner = (ci) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.categories[ci].partners.push('')
      return copy
    })
  }

  const removePartner = (ci, pi) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.categories[ci].partners.splice(pi, 1)
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
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">介绍文案</label>
          <input type="text" value={form.intro || ''} onChange={updateField('intro')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      {form.categories?.map((cat, ci) => (
        <div key={ci} className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">分类名称</label>
              <input type="text" value={cat.name} onChange={updateCatName(ci)} className="w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button type="button" onClick={() => addPartner(ci)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
              <Plus size={16} /> 添加合作方
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cat.partners.map((partner, pi) => (
              <div key={pi} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                <input type="text" value={partner} onChange={updatePartner(ci, pi)} className="w-28 text-sm bg-transparent border-none focus:outline-none" />
                <button type="button" onClick={() => removePartner(ci, pi)} className="text-gray-400 hover:text-red-500">
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

export default function AdminPartners() {
  return (
    <EditorShell
      contentKey="partners"
      title="合作伙伴"
      subtitle="合作方分类及名单管理"
      renderForm={(props) => <PartnersForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
