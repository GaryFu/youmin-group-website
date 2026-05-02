import { deepClone } from '../../utils/deepClone'
import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2, Upload } from 'lucide-react'

function InnovationForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(deepClone(data))
  const [uploading, setUploading] = useState('') // key like 'ai-ii-ji'

  useEffect(() => { setForm(deepClone(data)) }, [data, resetKey])

  const handleImageUpload = async (file, ai, ii, ji) => {
    const key = `${ai}-${ii}-${ji}`
    setUploading(key)
    try {
      let blob = file
      if (file.size > 500 * 1024) {
        blob = await new Promise((resolve) => {
          const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const s = Math.min(1, 1600 / Math.max(img.width, img.height)); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); c.toBlob((b) => resolve(b || file), 'image/jpeg', 0.75) }; img.src = URL.createObjectURL(file)
        })
      }
      const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r(reader.result); reader.readAsDataURL(blob) })
      const ext = file.name.split('.').pop() || 'jpg'
      const safeName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
      const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
      const res = await fetch('/api/upload/image', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` }, body: JSON.stringify({ image: base64, filename: safeName }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'upload failed')
      if (d.url) {
        setForm((f) => { const copy = deepClone(f); if (!copy.achievements[ai].items[ii].images) copy.achievements[ai].items[ii].images = []; copy.achievements[ai].items[ii].images[ji] = d.url; return copy })
      }
    } catch (err) { alert('上传失败: ' + err.message) }
    setUploading('')
  }

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

  const updateCenter = (ci, field) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.centers[ci][field] = e.target.value
      return copy
    })
  }

  const updateDescPoint = (ci, di) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.centers[ci].description[di] = e.target.value
      return copy
    })
  }

  const addDescPoint = (ci) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.centers[ci].description.push('')
      return copy
    })
  }

  const removeDescPoint = (ci, di) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.centers[ci].description.splice(di, 1)
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
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">介绍文案</label>
          <textarea rows={2} value={form.intro || ''} onChange={updateField('intro')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      {form.centers?.map((center, ci) => (
        <div key={ci} className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">研发中心 #{ci + 1}</h3>
            <button type="button" onClick={() => addDescPoint(ci)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
              <Plus size={16} /> 添加描述
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">名称</label>
              <input type="text" value={center.name} onChange={updateCenter(ci, 'name')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">图标代码</label>
              <input type="text" value={center.icon} onChange={updateCenter(ci, 'icon')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="space-y-2">
            {center.description.map((d, di) => (
              <div key={di} className="flex items-center gap-2">
                <input type="text" value={d} onChange={updateDescPoint(ci, di)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="button" onClick={() => removeDescPoint(ci, di)} className="text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Achievement Detail Items */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">成果详情（点击数字卡片后的展示内容）</h3>
        {(form.achievements || []).map((ach, ai) => (
          <div key={ai} className="border border-gray-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400">#{ai + 1}</span>
                <input type="text" value={ach.label} onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.achievements[ai].label = e.target.value; return copy }) }} className="w-32 px-2 py-1.5 border border-gray-200 rounded text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="名称" />
                <input type="text" value={ach.value} onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.achievements[ai].value = e.target.value; return copy }) }} className="w-16 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="值" />
              </div>
              <button type="button" onClick={() => { setForm((f) => { const copy = deepClone(f); if (!copy.achievements[ai].items) copy.achievements[ai].items = []; copy.achievements[ai].items.push({ title: '', desc: '', images: [] }); return copy }) }} className="text-xs text-green-600 flex items-center gap-1"><Plus size={12} /> 添加条目</button>
            </div>
            {(ach.items || []).map((item, ii) => (
              <div key={ii} className="mb-3 ml-4 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <input type="text" value={item.title} onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.achievements[ai].items[ii].title = e.target.value; return copy }) }} className="w-40 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="标题" />
                  <input type="text" value={item.desc || ''} onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.achievements[ai].items[ii].desc = e.target.value; return copy }) }} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" placeholder="描述" />
                  <button type="button" onClick={() => { setForm((f) => { const copy = deepClone(f); copy.achievements[ai].items.splice(ii, 1); return copy }) }} className="text-red-300"><Trash2 size={12} /></button>
                </div>
                {(item.images || []).map((img, ji) => (
                  <div key={ji} className="flex items-center gap-1 ml-2 mb-1">
                    <input type="text" value={img} onChange={(e) => { setForm((f) => { const copy = deepClone(f); copy.achievements[ai].items[ii].images[ji] = e.target.value; return copy }) }} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none" placeholder={`图片 ${ji + 1} URL`} />
                    <label className={`cursor-pointer px-1.5 py-0.5 rounded text-xs flex items-center ${uploading === `${ai}-${ii}-${ji}` ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-green-50 text-gray-500'}`}><Upload size={10} />{uploading === `${ai}-${ii}-${ji}` ? '...' : ''}<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, ai, ii, ji); e.target.value = '' }} /></label>
                    <button type="button" onClick={() => { setForm((f) => { const copy = deepClone(f); copy.achievements[ai].items[ii].images.splice(ji, 1); return copy }) }} className="text-red-300"><Trash2 size={10} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => { setForm((f) => { const copy = deepClone(f); if (!copy.achievements[ai].items[ii].images) copy.achievements[ai].items[ii].images = []; copy.achievements[ai].items[ii].images.push(''); return copy }) }} className="text-xs text-green-500 ml-2 flex items-center gap-0.5"><Plus size={10} /> 添加图片</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button type="submit" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
        保存修改
      </button>
    </form>
  )
}

export default function AdminInnovation() {
  return (
    <EditorShell
      contentKey="innovation"
      title="科研创新"
      subtitle="研究院介绍、研发中心管理"
      renderForm={(props) => <InnovationForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
