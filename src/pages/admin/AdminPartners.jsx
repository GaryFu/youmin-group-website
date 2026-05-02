import { useState, useEffect, useRef } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2, Handshake, Save } from 'lucide-react'
import { useContent } from '../../context/ContentContext'

function PartnersForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)
  const initialized = useRef(false)
  const { content } = useContent()

  useEffect(() => {
    if (!initialized.current || resetKey > 0) {
      setForm(JSON.parse(JSON.stringify(data)))
      initialized.current = true
    }
  }, [data, resetKey])

  const loading = !content

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const updateCatName = (i) => (e) => setForm((f) => ({ ...f, categories: f.categories.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c) }))

  const updatePartner = (ci, pi) => (e) => setForm((f) => ({
    ...f,
    categories: f.categories.map((c, idx) =>
      idx === ci ? { ...c, partners: c.partners.map((p, j) => j === pi ? e.target.value : p) } : c
    )
  }))

  const addPartner = (ci) => setForm((f) => ({
    ...f, categories: f.categories.map((c, i) => i === ci ? { ...c, partners: [...c.partners, ''] } : c)
  }))

  const removePartner = (ci, pi) => setForm((f) => ({
    ...f, categories: f.categories.map((c, i) => i === ci ? { ...c, partners: c.partners.filter((_, j) => j !== pi) } : c)
  }))

  const addCategory = () => setForm((f) => ({ ...f, categories: [...(f.categories || []), { name: '', partners: [] }] }))
  const removeCategory = (ci) => setForm((f) => ({ ...f, categories: f.categories.filter((_, i) => i !== ci) }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Page meta */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">页面信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">中文标题</label><input type="text" value={form.title || ''} onChange={setField('title')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">英文小标题</label><input type="text" value={form.subtitle || ''} onChange={setField('subtitle')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">介绍文案</label><input type="text" value={form.intro || ''} onChange={setField('intro')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          合作方分类 ({form.categories?.length || 0})
        </h3>
        <button type="button" onClick={addCategory} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium">
          <Plus size={16} /> 添加分类
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">加载中...</p>
        </div>
      ) : !form.categories?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          <Handshake size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">暂无合作方分类，点击"添加分类"开始</p>
        </div>
      ) : (
        form.categories.map((cat, ci) => (
          <div key={`cat-${ci}`} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input type="text" value={cat.name} onChange={updateCatName(ci)} className="w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="分类名称" />
                <button type="button" onClick={() => removeCategory(ci)} className="text-red-400 hover:text-red-600 p-1" title="删除分类"><Trash2 size={16} /></button>
              </div>
              <button type="button" onClick={() => addPartner(ci)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"><Plus size={16} /> 添加合作方</button>
            </div>
            {cat.partners.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">暂无合作方</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cat.partners.map((partner, pi) => (
                  <div key={`p-${ci}-${pi}`} className="flex items-center gap-1 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                    <input type="text" value={partner} onChange={updatePartner(ci, pi)} className="w-28 text-sm bg-transparent border-none focus:outline-none text-green-800" placeholder="名称" />
                    <button type="button" onClick={() => removePartner(ci, pi)} className="text-green-400 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Save bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 py-4 flex justify-end gap-3">
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-all">
          <Save size={16} /> {saving ? '保存中...' : '保存修改'}
        </button>
      </div>
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
