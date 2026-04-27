import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'

function SiteConfigForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState({ ...data })

  useEffect(() => { setForm({ ...data }) }, [data, resetKey])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => { e.preventDefault(); onSave(form) }

  const fields = [
    { key: 'name', label: '集团全称' },
    { key: 'shortName', label: '品牌简称' },
    { key: 'englishName', label: '英文名称' },
    { key: 'tagline', label: '品牌口号' },
    { key: 'mission', label: '企业愿景' },
    { key: 'description', label: '集团简介（摘要）' },
    { key: 'address', label: '地址' },
    { key: 'phone', label: '电话' },
    { key: 'email', label: '邮箱' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ key, label }) => (
          <div key={key} className={key === 'description' || key === 'tagline' || key === 'mission' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            {key === 'description' || key === 'mission' ? (
              <textarea
                value={form[key] || ''}
                onChange={update(key)}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <input
                type="text"
                value={form[key] || ''}
                onChange={update(key)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            )}
          </div>
        ))}
      </div>
      <button type="submit" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
        保存修改
      </button>
    </form>
  )
}

export default function AdminSiteConfig() {
  return (
    <EditorShell
      contentKey="site"
      title="集团基本信息"
      subtitle="公司名称、联系方式等基础信息"
      renderForm={(props) => <SiteConfigForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
