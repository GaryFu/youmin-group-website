import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Upload, Save } from 'lucide-react'
import { deepClone } from '../../utils/deepClone'
import { useContent } from '../../context/ContentContext'
import Toast from '../../components/admin/Toast'

export default function AdminCompanyEdit() {
  const { tabId, companyId } = useParams()
  const navigate = useNavigate()
  const { getContent, updateContent, content } = useContent()
  const industryData = getContent('industry')
  const tab = industryData.tabs?.find((t) => t.id === tabId)
  const company = tab?.companies?.find((c) => String(c.id) === companyId)

  const [form, setForm] = useState(null)
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(-1)

  // Re-initialize form only when companyId changes or company data becomes richer
  const prevDataRef = useRef('')
  useEffect(() => {
    if (!company) return
    const key = JSON.stringify({ milestones: company.milestones?.length, images: company.images?.length, features: company.features?.length })
    if (key !== prevDataRef.current) {
      prevDataRef.current = key
      setForm(deepClone(company))
    }
  }, [company])

  if (!company || !form) {
    return <div className="p-8 text-center text-gray-400">{content ? '未找到该公司' : <span className="inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin align-middle" />}</div>
  }

  const setField = (f, v) => setForm((p) => ({ ...p, [f]: v }))

  const handleImageUpload = async (file, slotIndex) => {
    setUploading(slotIndex)
    try {
      let blob = file
      if (file.size > 500 * 1024) {
        blob = await new Promise((resolve) => {
          const img = new Image()
          img.onload = () => { const c = document.createElement('canvas'); const s = Math.min(1, 1600 / Math.max(img.width, img.height)); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); c.toBlob((b) => resolve(b || file), 'image/jpeg', 0.75) }
          img.src = URL.createObjectURL(file)
        })
      }
      const base64 = await new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(blob) })
      const ext = file.name.split('.').pop() || 'jpg'
      const safeName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
      const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
      const res = await fetch('/api/upload/image', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify({ image: base64, filename: safeName }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'upload failed')
      if (d.url) setForm((f) => { const imgs = [...(f.images || [])]; imgs[slotIndex] = d.url; return { ...f, images: imgs } })
    } catch (err) { setToast({ message: '上传失败: ' + err.message, type: 'error' }) }
    setUploading(-1)
  }

  const addImage = () => setForm((f) => ({ ...f, images: [...(f.images || []), ''] }))
  const removeImage = (i) => setForm((f) => ({ ...f, images: (f.images || []).filter((_, j) => j !== i) }))
  const setFeature = (i, field, v) => setForm((f) => { const arr = [...(f.features || [])]; arr[i] = { ...arr[i], [field]: v }; return { ...f, features: arr } })
  const addFeature = () => setForm((f) => ({ ...f, features: [...(f.features || []), { icon: 'CheckCircle2', text: '' }] }))
  const removeFeature = (i) => setForm((f) => ({ ...f, features: (f.features || []).filter((_, j) => j !== i) }))
  const setStat = (i, field, v) => setForm((f) => { const arr = [...(f.stats || [])]; arr[i] = { ...arr[i], [field]: v }; return { ...f, stats: arr } })
  const addStat = () => setForm((f) => ({ ...f, stats: [...(f.stats || []), { label: '', value: '' }] }))
  const removeStat = (i) => setForm((f) => ({ ...f, stats: (f.stats || []).filter((_, j) => j !== i) }))
  const setMilestone = (i, field, v) => setForm((f) => { const arr = [...(f.milestones || [])]; arr[i] = { ...arr[i], [field]: v }; return { ...f, milestones: arr } })
  const addMilestone = () => setForm((f) => ({ ...f, milestones: [...(f.milestones || []), { year: '', event: '' }] }))
  const removeMilestone = (i) => setForm((f) => ({ ...f, milestones: (f.milestones || []).filter((_, j) => j !== i) }))

  const handleSave = async () => {
    setSaving(true)
    const data = deepClone(industryData)
    const t = data.tabs.find((t) => t.id === tabId)
    const ci = t.companies.findIndex((c) => String(c.id) === companyId)
    t.companies[ci] = { ...form }
    try {
      await updateContent('industry', data)
      setToast({ message: '保存成功', type: 'success' })
    } catch (err) {
      setToast({ message: err.message || '保存失败', type: 'error' })
    }
    setSaving(false)
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/industry" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.name || '未命名'}</h1>
            <p className="text-sm text-gray-400">{tab.label} · 编辑</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-all">
          {saving ? '保存中...' : <><Save size={16} /> 保存</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">基本信息</h3>
            <div className="space-y-3">
              <div><label className="block text-xs text-gray-500 mb-1">公司名称</label><input type="text" value={form.name || ''} onChange={(e) => setField('name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">标语</label><input type="text" value={form.tagline || ''} onChange={(e) => setField('tagline', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">卡片简述</label><input type="text" value={form.desc || ''} onChange={(e) => setField('desc', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">企业概况</label><textarea value={form.overview || ''} onChange={(e) => setField('overview', e.target.value)} rows={5} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">发展历程</h3>
              <button onClick={addMilestone} className="text-xs text-green-600 flex items-center gap-1"><Plus size={12} /> 添加</button>
            </div>
            <div className="space-y-2">
              {(form.milestones || []).map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={m.year} onChange={(e) => setMilestone(i, 'year', e.target.value)} className="w-20 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="年份" />
                  <input type="text" value={m.event} onChange={(e) => setMilestone(i, 'event', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="事件" />
                  <button onClick={() => removeMilestone(i)} className="text-red-300"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">企业图片</h3>
              <button onClick={addImage} className="text-xs text-green-600 flex items-center gap-1"><Plus size={12} /> 添加</button>
            </div>
            {(form.images || []).map((img, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={img} onChange={(e) => { const imgs = [...(form.images || [])]; imgs[i] = e.target.value; setField('images', imgs) }} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder={`图片 ${i + 1} URL`} />
                <label className={`cursor-pointer px-2 py-1 rounded text-xs flex items-center ${uploading === i ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}><Upload size={12} />{uploading === i ? '...' : ''}<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, i); e.target.value = '' }} /></label>
                <button onClick={() => removeImage(i)} className="text-red-300"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">业务亮点</h3>
              <button onClick={addFeature} className="text-xs text-green-600 flex items-center gap-1"><Plus size={12} /> 添加</button>
            </div>
            <div className="space-y-2">
              {(form.features || []).map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={feat.icon || 'CheckCircle2'} onChange={(e) => setFeature(i, 'icon', e.target.value)} className="w-16 px-1 py-1.5 border border-gray-200 rounded text-xs"><option value="CheckCircle2">✅</option><option value="Award">🏆</option><option value="Star">⭐</option></select>
                  <input type="text" value={feat.text} onChange={(e) => setFeature(i, 'text', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="亮点" />
                  <button onClick={() => removeFeature(i)} className="text-red-300"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">基本信息</h3>
              <button onClick={addStat} className="text-xs text-green-600 flex items-center gap-1"><Plus size={12} /> 添加</button>
            </div>
            <div className="space-y-2">
              {(form.stats || []).map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={stat.label} onChange={(e) => setStat(i, 'label', e.target.value)} className="w-24 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="名称" />
                  <input type="text" value={stat.value} onChange={(e) => setStat(i, 'value', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="值" />
                  <button onClick={() => removeStat(i)} className="text-red-300"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
