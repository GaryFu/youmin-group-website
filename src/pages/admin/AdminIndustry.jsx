import { deepClone } from '../../utils/deepClone'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2, Edit3, Building2, Factory, Ship, ChevronRight } from 'lucide-react'

const tabIcons = { rd: Building2, agri: Factory, trade: Ship }

function IndustryForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(deepClone(data))
  const [activeTab, setActiveTab] = useState('rd')

  useEffect(() => { setForm(deepClone(data)) }, [data, resetKey])

  const updateField = (path) => (e) => {
    setForm((f) => { const keys = path.split('.'); const copy = deepClone(f); let obj = copy; for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]; obj[keys[keys.length - 1]] = e.target.value; return copy })
  }

  const addCompany = (tabIdx) => {
    setForm((f) => {
      const copy = deepClone(f)
      const maxId = copy.tabs[tabIdx].companies.reduce((max, c) => Math.max(max, c.id || 0), 0)
      copy.tabs[tabIdx].companies.push({ id: maxId + 1, name: '', desc: '', tagline: '', overview: '', fullDescription: '', images: [], features: [], stats: [], milestones: [] })
      return copy
    })
  }

  const removeCompany = (tabIdx, ci) => {
    setForm((f) => { const copy = deepClone(f); copy.tabs[tabIdx].companies.splice(ci, 1); return copy })
  }

  const handleSave = () => onSave(form)

  return (
    <div>
      {/* Page meta */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">英文小标题</label><input type="text" value={form.subtitle || ''} onChange={updateField('subtitle')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">中文标题</label><input type="text" value={form.title || ''} onChange={updateField('title')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 mb-6">
        {(form.tabs || []).map((tab) => {
          const Icon = tabIcons[tab.id] || Building2
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-green-50'}`}>
              <Icon size={16} /> {tab.label} <span className="ml-1 opacity-70">({tab.companies?.length || 0})</span>
            </button>
          )
        })}
      </div>

      {/* Company list for active tab */}
      {(form.tabs || []).filter(t => t.id === activeTab).map((tab, tabIdx) => (
        <div key={tab.id}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-400">共 {tab.companies?.length || 0} 家公司</span>
            <button onClick={() => addCompany(form.tabs.indexOf(tab))} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"><Plus size={16} /> 添加公司</button>
          </div>

          {!tab.companies?.length ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">暂无公司</div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              {tab.companies.map((company, ci) => (
                <div key={ci} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold text-xs shrink-0">
                    {String(ci + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{company.name || '未命名'}</p>
                    <p className="text-xs text-gray-400 truncate">{company.desc?.slice(0, 50)}</p>
                  </div>
                  <Link
                    to={company.id ? `/admin/industry/${tab.id}/${company.id}` : '#'}
                    className={`shrink-0 p-2 rounded-lg transition-colors ${company.id ? 'text-gray-400 hover:text-green-600 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed'}`}
                    title={company.id ? '编辑' : '请先保存后再编辑'}
                  >
                    <Edit3 size={16} />
                  </Link>
                  <button onClick={() => removeCompany(form.tabs.indexOf(tab), ci)} className="shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={handleSave} className="mt-6 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">保存修改</button>
    </div>
  )
}

export default function AdminIndustry() {
  return (
    <EditorShell
      contentKey="industry"
      title="产业布局"
      subtitle="管理三大板块及旗下子公司"
      renderForm={(props) => <IndustryForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
