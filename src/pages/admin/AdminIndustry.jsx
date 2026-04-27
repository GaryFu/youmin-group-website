import { deepClone } from '../../utils/deepClone'
import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2 } from 'lucide-react'

function IndustryForm({ data, onSave, resetKey }) {
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

  const updateCompany = (tabIdx, companyIdx, field) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.tabs[tabIdx].companies[companyIdx][field] = e.target.value
      return copy
    })
  }

  const addCompany = (tabIdx) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.tabs[tabIdx].companies.push({ name: '', desc: '' })
      return copy
    })
  }

  const removeCompany = (tabIdx, companyIdx) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.tabs[tabIdx].companies.splice(companyIdx, 1)
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

      {form.tabs?.map((tab, tabIdx) => (
        <div key={tab.id} className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">{tab.label}</h3>
              <span className="text-xs text-gray-400">ID: {tab.id}</span>
            </div>
            <button type="button" onClick={() => addCompany(tabIdx)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
              <Plus size={16} /> 添加公司
            </button>
          </div>
          <div className="space-y-3">
            {tab.companies.map((company, ci) => (
              <div key={ci} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <input type="text" value={company.name} onChange={updateCompany(tabIdx, ci, 'name')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="公司名称" />
                  <input type="text" value={company.desc} onChange={updateCompany(tabIdx, ci, 'desc')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="公司简介" />
                </div>
                <button type="button" onClick={() => removeCompany(tabIdx, ci)} className="text-red-400 hover:text-red-600 mt-2">
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

export default function AdminIndustry() {
  return (
    <EditorShell
      contentKey="industry"
      title="产业布局"
      subtitle="三大板块及旗下子公司管理"
      renderForm={(props) => <IndustryForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
