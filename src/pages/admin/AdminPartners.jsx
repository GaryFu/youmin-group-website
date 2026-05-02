import { useState, useEffect, useRef } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2, Handshake, Save, Edit3, X, Upload, Image } from 'lucide-react'
import { useContent } from '../../context/ContentContext'

function PartnerEditor({ partner, onSave, onCancel }) {
  const [form, setForm] = useState({ ...partner })
  const [uploading, setUploading] = useState(false)

  useEffect(() => { setForm({ ...partner }) }, [partner])

  const handleUpload = async (file) => {
    setUploading(true)
    try {
      const blob = file.size > 500 * 1024 ? await new Promise((resolve) => {
        const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const s = Math.min(1, 800 / Math.max(img.width, img.height)); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); c.toBlob((b) => resolve(b || file), 'image/jpeg', 0.75) }; img.src = URL.createObjectURL(file)
      }) : file
      const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r(reader.result); reader.readAsDataURL(blob) })
      const ext = file.name.split('.').pop() || 'jpg'
      const safeName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
      const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
      const res = await fetch('/api/upload/image', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` }, body: JSON.stringify({ image: base64, filename: safeName }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'upload failed')
      if (d.url) setForm((f) => ({ ...f, logo: d.url }))
    } catch (err) { alert('上传失败: ' + err.message) }
    setUploading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{partner.name ? '编辑' : '新增'}合作方</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div><label className="block text-xs text-gray-500 mb-1">名称</label><input type="text" value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Logo</label>
            <div className="flex gap-2">
              <input type="text" value={form.logo || ''} onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Logo URL" />
              <label className={`cursor-pointer px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${uploading ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-green-50 text-gray-500'}`}><Upload size={14} />{uploading ? '...' : ''}<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }} /></label>
            </div>
            {form.logo && <img src={form.logo} alt="" className="mt-2 h-12 rounded object-contain" />}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">保存</button>
          <button onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
        </div>
      </div>
    </div>
  )
}

function PartnersForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null) // { ci, pi, partner }
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
  const addCategory = () => setForm((f) => ({ ...f, categories: [...(f.categories || []), { name: '', partners: [] }] }))
  const removeCategory = (ci) => setForm((f) => ({ ...f, categories: f.categories.filter((_, i) => i !== ci) }))

  const handlePartnerSave = (saved) => {
    if (editing.pi >= 0) {
      // Edit existing
      setForm((f) => ({ ...f, categories: f.categories.map((c, i) => i === editing.ci ? { ...c, partners: c.partners.map((p, j) => j === editing.pi ? saved : p) } : c) }))
    } else {
      // New partner
      setForm((f) => ({ ...f, categories: f.categories.map((c, i) => i === editing.ci ? { ...c, partners: [...c.partners, saved] } : c) }))
    }
    setEditing(null)
  }

  const removePartner = (ci, pi) => setForm((f) => ({ ...f, categories: f.categories.map((c, i) => i === ci ? { ...c, partners: c.partners.filter((_, j) => j !== pi) } : c) }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {editing && <PartnerEditor partner={editing.partner} onSave={handlePartnerSave} onCancel={() => setEditing(null)} />}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">页面信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">中文标题</label><input type="text" value={form.title || ''} onChange={setField('title')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">英文小标题</label><input type="text" value={form.subtitle || ''} onChange={setField('subtitle')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">介绍文案</label><input type="text" value={form.intro || ''} onChange={setField('intro')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">合作方分类 ({form.categories?.length || 0})</h3>
        <button type="button" onClick={addCategory} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"><Plus size={16} /> 添加分类</button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-400">加载中...</p></div>
      ) : !form.categories?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400"><Handshake size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">暂无合作方分类</p></div>
      ) : (
        form.categories.map((cat, ci) => (
          <div key={`cat-${ci}`} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input type="text" value={cat.name} onChange={updateCatName(ci)} className="w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="分类名称" />
                <button type="button" onClick={() => removeCategory(ci)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
              </div>
              <button type="button" onClick={() => setEditing({ ci, pi: -1, partner: { name: '', logo: '' } })} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"><Plus size={16} /> 添加合作方</button>
            </div>
            {cat.partners.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">暂无合作方</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cat.partners.map((partner, pi) => (
                  <div key={`p-${ci}-${pi}`} className="relative group bg-gray-100 rounded-xl p-4 border border-gray-200 hover:border-green-200 transition-all">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                      <button type="button" onClick={() => setEditing({ ci, pi, partner })} className="p-1 bg-white rounded shadow text-gray-400 hover:text-green-600"><Edit3 size={12} /></button>
                      <button type="button" onClick={() => removePartner(ci, pi)} className="p-1 bg-white rounded shadow text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      {partner.logo ? (
                        <div className="w-full bg-white rounded-lg p-2 mb-2 flex items-center justify-center" style={{ minHeight: '40px' }}>
                          <img src={partner.logo} alt={partner.name} className="max-h-8 object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2"><Image size={20} className="text-gray-300" /></div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{partner.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <div className="sticky bottom-0 bg-white border-t border-gray-100 py-4 flex justify-end gap-3">
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"><Save size={16} /> {saving ? '保存中...' : '保存修改'}</button>
      </div>
    </form>
  )
}

export default function AdminPartners() {
  return (
    <EditorShell contentKey="partners" title="合作伙伴" subtitle="合作方分类及名单管理" renderForm={(props) => <PartnersForm {...props} />} onDataExtract={(data) => data} />
  )
}
