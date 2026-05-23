import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit3, X, Upload, Image as ImageIcon, Rocket } from 'lucide-react'
import EditorShell from '../../components/admin/EditorShell'
import Toast from '../../components/admin/Toast'
import { deepClone } from '../../utils/deepClone'

function normalizeImage(image, index) {
  if (typeof image === 'string') return { url: image, afterParagraph: index === 0 ? '' : String(index) }
  return { url: image?.url || '', afterParagraph: index === 0 ? '' : String(image?.afterParagraph || '') }
}

function normalizeArticle(article) {
  return {
    ...article,
    images: (article.images?.length > 0 ? article.images : (article.cover ? [article.cover] : [])).map(normalizeImage),
  }
}

async function uploadImage(file) {
  let blob = file
  if (file.size > 500 * 1024) {
    blob = await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, 1600 / Math.max(img.width, img.height))
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((b) => resolve(b || file), 'image/jpeg', 0.75)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  const ext = file.name.split('.').pop() || 'jpg'
  const safeName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
  const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
  const res = await fetch('/api/upload/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
    body: JSON.stringify({ image: base64, filename: safeName }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '上传失败')
  if (!data.url) throw new Error('服务器未返回图片地址')
  return data.url
}

function ArticleEditor({ article, categories, onSave, onCancel }) {
  const [form, setForm] = useState(() => normalizeArticle(article))
  const [uploading, setUploading] = useState(-1)
  const [error, setError] = useState(null)

  useEffect(() => setForm(normalizeArticle(article)), [article])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const setImageField = (index, field, value) => setForm((prev) => {
    const images = [...(prev.images || [])]
    images[index] = { ...(images[index] || {}), [field]: value }
    return { ...prev, images, cover: images[0]?.url || '' }
  })
  const addImage = () => setForm((prev) => ({ ...prev, images: [...(prev.images || []), { url: '', afterParagraph: '' }] }))
  const removeImage = (index) => setForm((prev) => {
    const images = [...(prev.images || [])]
    images.splice(index, 1)
    return { ...prev, images, cover: images[0]?.url || '' }
  })
  const handleUpload = async (file, index) => {
    setUploading(index)
    try {
      const url = await uploadImage(file)
      setImageField(index, 'url', url)
    } catch (err) {
      setError('图片上传失败：' + err.message)
      setTimeout(() => setError(null), 3000)
    }
    setUploading(-1)
  }
  const handleBatchUpload = async (files) => {
    const fileList = Array.from(files || [])
    if (fileList.length === 0) return
    const startIndex = (form.images || []).length
    setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...fileList.map(() => ({ url: '', afterParagraph: '' }))] }))
    for (let i = 0; i < fileList.length; i++) await handleUpload(fileList[i], startIndex + i)
  }
  const handleSave = () => {
    const images = (form.images || [])
      .filter((image) => image?.url)
      .map((image, index) => ({ url: image.url, afterParagraph: index === 0 ? null : Number.parseInt(image.afterParagraph, 10) || null }))
    onSave({ ...form, id: form.id || Date.now(), images, cover: images[0]?.url || '' })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        {error && <div className="fixed top-4 left-1/2 z-[100] -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-center text-sm font-medium text-red-700 shadow-lg">{error}</div>}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h3 className="font-bold text-gray-900">{form.id ? '编辑党建文章' : '新增党建文章'}</h3>
          <button onClick={onCancel} className="rounded-lg p-2 hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="space-y-4 p-6">
          <div><label className="block text-xs text-gray-500 mb-1">标题</label><input value={form.title || ''} onChange={(e) => setField('title', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">日期</label><input type="date" value={form.date || ''} onChange={(e) => setField('date', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">分类</label><input value={form.category || '党建动态'} onChange={(e) => setField('category', e.target.value)} list="party-categories" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /><datalist id="party-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist></div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">摘要</label><textarea rows={2} value={form.digest || ''} onChange={(e) => setField('digest', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">正文</label>
            <textarea rows={8} value={form.content || ''} onChange={(e) => setField('content', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="mt-1 text-[11px] text-gray-400">支持 Markdown：## 标题、### 小标题、**加粗**、- 列表、1. 编号、&gt; 引用、---</p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">文章图片</label>
            <p className="mb-2 text-[11px] text-gray-400">第一张作为封面图；后续图片可指定插入到第几段正文后。</p>
            <div className="space-y-2">
              {(form.images || []).map((image, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/60 p-2">
                  <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-white">
                    {image.url ? <img src={image.url} alt="" className="h-full w-full object-contain" /> : <ImageIcon size={18} className="text-gray-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-700">{i === 0 ? '封面图' : `文中插图 ${i}`}</p>
                    <p className="truncate text-[11px] text-gray-400">{image.url || `图片 ${i + 1}`}</p>
                    {i > 0 && (
                      <label className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                        插入到第
                        <input type="number" min="1" value={image.afterParagraph || ''} onChange={(e) => setImageField(i, 'afterParagraph', e.target.value)} className="w-14 rounded border border-gray-200 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500" />
                        段后
                      </label>
                    )}
                  </div>
                  <label className={`flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs ${uploading === i ? 'bg-red-100 text-red-600' : 'bg-white text-gray-500 hover:bg-red-50 hover:text-red-600'}`}>
                    <Upload size={12} />{uploading === i ? '上传中' : '上传'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file, i); e.target.value = '' }} />
                  </label>
                  <button type="button" onClick={() => removeImage(i)} className="p-1.5 text-red-300 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-red-600 hover:text-red-700"><Upload size={12} /> 上传多张图片<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleBatchUpload(e.target.files); e.target.value = '' }} /></label>
              <button type="button" onClick={addImage} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-700"><Plus size={12} /> 添加空位</button>
            </div>
          </div>
          <div className="flex gap-3 border-t border-gray-100 pt-4">
            <button onClick={handleSave} className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700">保存文章</button>
            <button onClick={onCancel} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50">取消</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartyBuildingForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(deepClone(data))
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { setForm(deepClone(data)) }, [data, resetKey])

  const categories = [...new Set((form.articles || []).map((article) => article.category).filter(Boolean))]
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const handleArticleSave = (article) => {
    setForm((prev) => {
      const articles = prev.articles || []
      const exists = articles.some((item) => String(item.id) === String(article.id))
      return { ...prev, articles: exists ? articles.map((item) => String(item.id) === String(article.id) ? article : item) : [article, ...articles] }
    })
    setEditing(null)
  }
  const removeArticle = (article) => {
    if (!confirm(`确定删除「${article.title}」？`)) return
    setForm((prev) => ({ ...prev, articles: (prev.articles || []).filter((item) => String(item.id) !== String(article.id)) }))
  }
  const handlePublish = async () => {
    if (!confirm('确定要发布党建更改到网站吗？这将触发 Vercel 重新部署，约 1 分钟后生效。')) return
    const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
    const res = await fetch('/api/news/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
    })
    const data = await res.json()
    setToast({
      title: res.ok ? '发布已触发' : '发布失败',
      message: data.message || data.error || '操作完成',
      type: res.ok ? 'success' : 'error',
    })
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {editing && <ArticleEditor article={editing} categories={categories} onSave={handleArticleSave} onCancel={() => setEditing(null)} />}
      <div className="rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-900 shadow-sm">
        <div className="flex items-start gap-2">
          <Rocket size={17} className="mt-0.5 shrink-0 text-gold-600" />
          <div>
            <p className="font-semibold">党建修改后必须手动发布</p>
            <p className="mt-0.5 text-xs leading-5 text-gold-800">保存会立即写入后管数据库；公开网站使用静态内容，需要点击「发布到网站」触发部署后生效。</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900">页面信息</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div><label className="block text-xs text-gray-500 mb-1">中文标题</label><input value={form.title || ''} onChange={(e) => setField('title', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">英文小标题</label><input value={form.subtitle || ''} onChange={(e) => setField('subtitle', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">介绍文案</label><input value={form.intro || ''} onChange={(e) => setField('intro', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">党建文章 ({form.articles?.length || 0})</h3>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handlePublish} className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-600"><Rocket size={16} /> 发布到网站</button>
          <button type="button" onClick={() => setEditing({ date: new Date().toISOString().slice(0, 10), category: '党建动态', title: '', digest: '', content: '', images: [] })} className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"><Plus size={16} /> 新增文章</button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {(form.articles || []).length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">暂无党建文章</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {form.articles.map((article) => (
              <div key={article.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                <span className="w-24 shrink-0 text-xs text-gray-400">{article.date}</span>
                <span className="shrink-0 rounded bg-red-50 px-2 py-0.5 text-xs text-red-600">{article.category}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{article.title}</span>
                <button type="button" onClick={() => setEditing(article)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Edit3 size={16} /></button>
                <button type="button" onClick={() => removeArticle(article)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button type="submit" className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700">保存修改</button>
    </form>
  )
}

export default function AdminPartyBuilding() {
  return (
    <EditorShell contentKey="partyBuilding" title="党建工作" subtitle="党建文章与页面信息管理" renderForm={(props) => <PartyBuildingForm {...props} />} onDataExtract={(data) => data} />
  )
}
