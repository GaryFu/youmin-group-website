import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'

function ContactForm({ data, onSave, resetKey }) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">页面信息</h3>
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

      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">联系信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'info.address', label: '地址' },
            { key: 'info.phone', label: '电话' },
            { key: 'info.email', label: '邮箱' },
            { key: 'info.hours', label: '工作时间' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input type="text" value={form.info?.[key.split('.')[1]] || ''} onChange={updateField(key)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
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

export default function AdminContact() {
  return (
    <EditorShell
      contentKey="contact"
      title="联系我们"
      subtitle="联系页面信息管理"
      renderForm={(props) => <ContactForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
