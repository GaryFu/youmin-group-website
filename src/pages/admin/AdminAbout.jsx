import { deepClone } from '../../utils/deepClone'
import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2 } from 'lucide-react'

function AboutForm({ data, onSave, resetKey }) {
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

  const updateOverviewPara = (i) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.overview.paragraphs[i] = e.target.value
      return copy
    })
  }

  const updateCultureItem = (i, field) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.culture.items[i][field] = e.target.value
      return copy
    })
  }

  const updateTimeline = (i, field) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.timeline[i][field] = field === 'year' ? e.target.value : e.target.value
      return copy
    })
  }

  const addTimeline = () => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.timeline.push({ year: '', event: '' })
      return copy
    })
  }

  const removeTimeline = (i) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.timeline.splice(i, 1)
      return copy
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">页面基本信息</h3>
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

      {/* Overview */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">集团概况</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">区块标题</label>
          <input type="text" value={form.overview?.title || ''} onChange={updateField('overview.title')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        {form.overview?.paragraphs?.map((p, i) => (
          <div key={i} className="mt-3">
            <label className="block text-sm font-medium text-gray-500 mb-1">段落 {i + 1}</label>
            <textarea rows={3} value={p} onChange={updateOverviewPara(i)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        ))}
      </div>

      {/* Culture */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">企业文化</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">区块标题</label>
          <input type="text" value={form.culture?.title || ''} onChange={updateField('culture.title')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="space-y-3 mt-3">
          {form.culture?.items?.map((item, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="text" value={item.label} onChange={updateCultureItem(i, 'label')} className="col-span-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="标签" />
              <input type="text" value={item.value} onChange={updateCultureItem(i, 'value')} className="col-span-4 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="内容" />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">发展历程</h3>
          <button type="button" onClick={addTimeline} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
            <Plus size={16} /> 添加年份
          </button>
        </div>
        <div className="space-y-3">
          {form.timeline?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="text" value={item.year} onChange={updateTimeline(i, 'year')} className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="年份" />
              <input type="text" value={item.event} onChange={updateTimeline(i, 'event')} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="事件" />
              <button type="button" onClick={() => removeTimeline(i)} className="text-red-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
        保存修改
      </button>
    </form>
  )
}

export default function AdminAbout() {
  return (
    <EditorShell
      contentKey="about"
      title="集团简介"
      subtitle="页面信息、集团概况、企业文化、发展历程"
      renderForm={(props) => <AboutForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
