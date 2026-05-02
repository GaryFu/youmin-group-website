import { deepClone } from '../../utils/deepClone'
import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

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
      const maxId = copy.tabs[tabIdx].companies.reduce((max, c) => Math.max(max, c.id || 0), 0)
      copy.tabs[tabIdx].companies.push({ id: maxId + 1, name: '', desc: '', tagline: '', fullDescription: '', images: [], features: [], stats: [] })
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
              <div key={ci} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <input type="text" value={company.name} onChange={updateCompany(tabIdx, ci, 'name')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="公司名称" />
                    <input type="text" value={company.tagline || ''} onChange={updateCompany(tabIdx, ci, 'tagline')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="标语" />
                    <input type="text" value={company.desc} onChange={updateCompany(tabIdx, ci, 'desc')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="卡片简述" />
                    <textarea value={company.fullDescription || ''} onChange={updateCompany(tabIdx, ci, 'fullDescription')} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="详细描述" />
                  </div>
                  <button type="button" onClick={() => removeCompany(tabIdx, ci)} className="text-red-400 hover:text-red-600 mt-2"><Trash2 size={16} /></button>
                </div>
                {/* Features */}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-400">特性</span><button type="button" onClick={() => { setForm((f) => { const copy = deepClone(f); if (!copy.tabs[tabIdx].companies[ci].features) copy.tabs[tabIdx].companies[ci].features = []; copy.tabs[tabIdx].companies[ci].features.push({ icon: 'CheckCircle2', text: '' }); return copy }) }} className="text-xs text-green-600"><Plus size={10} /> 添加</button></div>
                  {(company.features || []).map((feat, fi) => (
                    <div key={fi} className="flex items-center gap-1 mb-1">
                      <select value={feat.icon || 'CheckCircle2'} onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.tabs[tabIdx].companies[ci].features[fi].icon = e.target.value; return copy }) }} className="w-16 px-1 py-0.5 border border-gray-200 rounded text-xs"><option value="Award">🏆</option><option value="Zap">⚡</option><option value="Shield">🛡️</option><option value="Star">⭐</option><option value="CheckCircle2">✅</option></select>
                      <input type="text" value={feat.text} onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.tabs[tabIdx].companies[ci].features[fi].text = e.target.value; return copy }) }} className="flex-1 px-2 py-0.5 border border-gray-200 rounded text-xs" placeholder="特性描述" />
                      <button type="button" onClick={() => { setForm((f) => { const copy = deepClone(f); copy.tabs[tabIdx].companies[ci].features.splice(fi, 1); return copy }) }} className="text-red-300"><Trash2 size={10} /></button>
                    </div>
                  ))}
                </div>
                {/* Stats */}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-400">基本信息</span><button type="button" onClick={() => { setForm((f) => { const copy = deepClone(f); if (!copy.tabs[tabIdx].companies[ci].stats) copy.tabs[tabIdx].companies[ci].stats = []; copy.tabs[tabIdx].companies[ci].stats.push({ label: '', value: '' }); return copy }) }} className="text-xs text-green-600"><Plus size={10} /> 添加</button></div>
                  {(company.stats || []).map((stat, si) => (
                    <div key={si} className="flex items-center gap-1 mb-1">
                      <input type="text" value={stat.label} onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.tabs[tabIdx].companies[ci].stats[si].label = e.target.value; return copy }) }} className="w-20 px-2 py-0.5 border border-gray-200 rounded text-xs" placeholder="名称" />
                      <input type="text" value={stat.value} onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.tabs[tabIdx].companies[ci].stats[si].value = e.target.value; return copy }) }} className="flex-1 px-2 py-0.5 border border-gray-200 rounded text-xs" placeholder="值" />
                      <button type="button" onClick={() => { setForm((f) => { const copy = deepClone(f); copy.tabs[tabIdx].companies[ci].stats.splice(si, 1); return copy }) }} className="text-red-300"><Trash2 size={10} /></button>
                    </div>
                  ))}
                </div>
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
