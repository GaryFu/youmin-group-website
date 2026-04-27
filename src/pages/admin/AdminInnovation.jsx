import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2 } from 'lucide-react'

function InnovationForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(structuredClone(data))

  useEffect(() => { setForm(structuredClone(data)) }, [data, resetKey])

  const handleSubmit = (e) => { e.preventDefault(); onSave(form) }

  const updateField = (path) => (e) => {
    setForm((f) => {
      const keys = path.split('.')
      const copy = structuredClone(f)
      let obj = copy
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = e.target.value
      return copy
    })
  }

  const updateCenter = (ci, field) => (e) => {
    setForm((f) => {
      const copy = structuredClone(f)
      copy.centers[ci][field] = e.target.value
      return copy
    })
  }

  const updateDescPoint = (ci, di) => (e) => {
    setForm((f) => {
      const copy = structuredClone(f)
      copy.centers[ci].description[di] = e.target.value
      return copy
    })
  }

  const addDescPoint = (ci) => {
    setForm((f) => {
      const copy = structuredClone(f)
      copy.centers[ci].description.push('')
      return copy
    })
  }

  const removeDescPoint = (ci, di) => {
    setForm((f) => {
      const copy = structuredClone(f)
      copy.centers[ci].description.splice(di, 1)
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
          <textarea rows={2} value={form.intro || ''} onChange={updateField('intro')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      {form.centers?.map((center, ci) => (
        <div key={ci} className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">研发中心 #{ci + 1}</h3>
            <button type="button" onClick={() => addDescPoint(ci)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
              <Plus size={16} /> 添加描述
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">名称</label>
              <input type="text" value={center.name} onChange={updateCenter(ci, 'name')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">图标代码</label>
              <input type="text" value={center.icon} onChange={updateCenter(ci, 'icon')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="space-y-2">
            {center.description.map((d, di) => (
              <div key={di} className="flex items-center gap-2">
                <input type="text" value={d} onChange={updateDescPoint(ci, di)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="button" onClick={() => removeDescPoint(ci, di)} className="text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 size={16} />
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

export default function AdminInnovation() {
  return (
    <EditorShell
      contentKey="innovation"
      title="科研创新"
      subtitle="研究院介绍、研发中心管理"
      renderForm={(props) => <InnovationForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
