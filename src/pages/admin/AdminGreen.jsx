import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2 } from 'lucide-react'

function GreenForm({ data, onSave, resetKey }) {
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

  const updatePractice = (pi, field) => (e) => {
    setForm((f) => {
      const copy = structuredClone(f)
      copy.practices[pi][field] = e.target.value
      return copy
    })
  }

  const updatePoint = (pi, poi) => (e) => {
    setForm((f) => {
      const copy = structuredClone(f)
      copy.practices[pi].points[poi] = e.target.value
      return copy
    })
  }

  const addPoint = (pi) => {
    setForm((f) => {
      const copy = structuredClone(f)
      copy.practices[pi].points.push('')
      return copy
    })
  }

  const removePoint = (pi, poi) => {
    setForm((f) => {
      const copy = structuredClone(f)
      copy.practices[pi].points.splice(poi, 1)
      return copy
    })
  }

  const updateSlogan = (i) => (e) => {
    setForm((f) => {
      const copy = structuredClone(f)
      copy.slogan[i] = e.target.value
      return copy
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Page info */}
      <div className="border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">英文小标题</label>
            <input type="text" value={form.subtitle || ''} onChange={updateField('subtitle')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">中文标题</label>
            <input type="text" value={form.title || ''} onChange={updateField('title')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">介绍文案</label>
          <textarea rows={3} value={form.intro || ''} onChange={updateField('intro')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      {/* Practices */}
      {form.practices?.map((p, pi) => (
        <div key={pi} className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">实践 #{pi + 1}</h3>
            <button type="button" onClick={() => addPoint(pi)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
              <Plus size={16} /> 添加要点
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input type="text" value={p.title} onChange={updatePractice(pi, 'title')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="标题" />
            <input type="text" value={p.icon} onChange={updatePractice(pi, 'icon')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="图标代码" />
          </div>
          <div className="space-y-2">
            {p.points.map((point, poi) => (
              <div key={poi} className="flex items-center gap-2">
                <input type="text" value={point} onChange={updatePoint(pi, poi)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="button" onClick={() => removePoint(pi, poi)} className="text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Slogan */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">底部口号</h3>
        <div className="grid grid-cols-4 gap-3">
          {form.slogan?.map((s, i) => (
            <input key={i} type="text" value={s} onChange={updateSlogan(i)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          ))}
        </div>
      </div>

      <button type="submit" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
        保存修改
      </button>
    </form>
  )
}

export default function AdminGreen() {
  return (
    <EditorShell
      contentKey="green"
      title="绿色发展"
      subtitle="绿色理念、实践、社会责任"
      renderForm={(props) => <GreenForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
