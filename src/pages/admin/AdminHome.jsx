import { deepClone } from '../../utils/deepClone'
import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'

function HomeForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(deepClone(data))

  useEffect(() => { setForm(deepClone(data)) }, [data, resetKey])

  const handleSubmit = (e) => { e.preventDefault(); onSave(form) }

  const updateHeroTitle = (e) => setForm((f) => ({ ...f, hero: { ...f.hero, title: e.target.value } }))
  const updateHeroSub = (e) => setForm((f) => ({ ...f, hero: { ...f.hero, subtitle: e.target.value } }))
  const updateHeroDesc = (e) => setForm((f) => ({ ...f, hero: { ...f.hero, description: e.target.value } }))

  const updateAdvantage = (i, field) => (e) => {
    setForm((f) => {
      const a = deepClone(f.advantages)
      a[i] = { ...a[i], [field]: e.target.value }
      return { ...f, advantages: a }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Hero */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Hero 首屏</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">标题</label>
            <input type="text" value={form.hero?.title || ''} onChange={updateHeroTitle} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">副标题</label>
            <input type="text" value={form.hero?.subtitle || ''} onChange={updateHeroSub} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">描述文案</label>
            <textarea rows={3} value={form.hero?.description || ''} onChange={updateHeroDesc} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
      </div>

      {/* Advantages */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">核心优势卡片</h3>
        <div className="space-y-4">
          {form.advantages?.map((adv, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">图标代码</label>
                <input type="text" value={adv.icon} onChange={updateAdvantage(i, 'icon')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">标题</label>
                <input type="text" value={adv.title} onChange={updateAdvantage(i, 'title')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">描述</label>
                <input type="text" value={adv.desc} onChange={updateAdvantage(i, 'desc')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
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

export default function AdminHome() {
  return (
    <EditorShell
      contentKey="home"
      title="首页内容"
      subtitle="Hero区、核心优势（集团简介由集团简介页面统一管理）"
      renderForm={(props) => <HomeForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
