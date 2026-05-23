import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit3, X, Briefcase, Rocket } from 'lucide-react'
import EditorShell from '../../components/admin/EditorShell'
import Toast from '../../components/admin/Toast'
import { deepClone } from '../../utils/deepClone'

function JobEditor({ job, onSave, onCancel }) {
  const [form, setForm] = useState({ ...job })
  useEffect(() => setForm({ ...job }), [job])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const setListItem = (field, index, value) => setForm((prev) => {
    const list = [...(prev[field] || [])]
    list[index] = value
    return { ...prev, [field]: list }
  })
  const addListItem = (field) => setForm((prev) => ({ ...prev, [field]: [...(prev[field] || []), ''] }))
  const removeListItem = (field, index) => setForm((prev) => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }))
  const handleSave = () => onSave({
    ...form,
    id: form.id || Date.now(),
    responsibilities: (form.responsibilities || []).filter(Boolean),
    requirements: (form.requirements || []).filter(Boolean),
    active: form.active !== false,
  })

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h3 className="font-bold text-gray-900">{form.id ? '编辑职位' : '新增职位'}</h3>
          <button onClick={onCancel} className="rounded-lg p-2 hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="space-y-4 p-6">
          <div><label className="block text-xs text-gray-500 mb-1">岗位名称</label><input value={form.title || ''} onChange={(e) => setField('title', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">部门</label><input value={form.department || ''} onChange={(e) => setField('department', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">地点</label><input value={form.location || ''} onChange={(e) => setField('location', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">类型</label><input value={form.type || ''} onChange={(e) => setField('type', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">招聘人数</label><input value={form.headcount || ''} onChange={(e) => setField('headcount', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">岗位简介</label><textarea rows={3} value={form.summary || ''} onChange={(e) => setField('summary', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          {[
            ['responsibilities', '岗位职责'],
            ['requirements', '任职要求'],
          ].map(([field, label]) => (
            <div key={field}>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs text-gray-500">{label}</label>
                <button type="button" onClick={() => addListItem(field)} className="inline-flex items-center gap-1 text-xs text-green-600"><Plus size={12} /> 添加</button>
              </div>
              <div className="space-y-2">
                {(form[field] || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input value={item} onChange={(e) => setListItem(field, index, e.target.value)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <button type="button" onClick={() => removeListItem(field, index)} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.active !== false} onChange={(e) => setField('active', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-green-600" />
            前台展示该职位
          </label>
          <div className="flex gap-3 border-t border-gray-100 pt-4">
            <button onClick={handleSave} className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700">保存职位</button>
            <button onClick={onCancel} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50">取消</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecruitmentForm({ data, onSave, resetKey }) {
  const [form, setForm] = useState(deepClone(data))
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => setForm(deepClone(data)), [data, resetKey])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const setContact = (field, value) => setForm((prev) => ({ ...prev, contact: { ...(prev.contact || {}), [field]: value } }))
  const handleJobSave = (job) => {
    setForm((prev) => {
      const jobs = prev.jobs || []
      const exists = jobs.some((item) => String(item.id) === String(job.id))
      return { ...prev, jobs: exists ? jobs.map((item) => String(item.id) === String(job.id) ? job : item) : [job, ...jobs] }
    })
    setEditing(null)
  }
  const removeJob = (job) => {
    if (!confirm(`确定删除「${job.title}」？`)) return
    setForm((prev) => ({ ...prev, jobs: (prev.jobs || []).filter((item) => String(item.id) !== String(job.id)) }))
  }
  const handlePublish = async () => {
    if (!confirm('确定要发布招聘更改到网站吗？这将触发 Vercel 重新部署，约 1 分钟后生效。')) return
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
      {editing && <JobEditor job={editing} onSave={handleJobSave} onCancel={() => setEditing(null)} />}
      <div className="rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-900 shadow-sm">
        <div className="flex items-start gap-2">
          <Rocket size={17} className="mt-0.5 shrink-0 text-gold-600" />
          <div>
            <p className="font-semibold">招聘修改后必须手动发布</p>
            <p className="mt-0.5 text-xs leading-5 text-gold-800">保存会立即写入后管数据库；公开网站使用静态内容，需要点击「发布到网站」触发部署后生效。</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900">页面信息</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div><label className="block text-xs text-gray-500 mb-1">中文标题</label><input value={form.title || ''} onChange={(e) => setField('title', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">英文小标题</label><input value={form.subtitle || ''} onChange={(e) => setField('subtitle', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">介绍文案</label><input value={form.intro || ''} onChange={(e) => setField('intro', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900">投递联系方式</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div><label className="block text-xs text-gray-500 mb-1">邮箱</label><input value={form.contact?.email || ''} onChange={(e) => setContact('email', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">电话</label><input value={form.contact?.phone || ''} onChange={(e) => setContact('phone', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">地址</label><input value={form.contact?.address || ''} onChange={(e) => setContact('address', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">招聘职位 ({form.jobs?.length || 0})</h3>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handlePublish} className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-600"><Rocket size={16} /> 发布到网站</button>
          <button type="button" onClick={() => setEditing({ title: '', department: '', location: '', type: '全职', headcount: '', summary: '', responsibilities: [], requirements: [], active: true })} className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"><Plus size={16} /> 新增职位</button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {(form.jobs || []).length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">暂无招聘职位</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {form.jobs.map((job) => (
              <div key={job.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                <Briefcase size={18} className="shrink-0 text-green-600" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{job.title}</span>
                <span className="hidden text-xs text-gray-400 sm:block">{job.department} · {job.location}</span>
                <span className={`rounded px-2 py-0.5 text-xs ${job.active !== false ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{job.active !== false ? '展示中' : '已隐藏'}</span>
                <button type="button" onClick={() => setEditing(job)} className="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600"><Edit3 size={16} /></button>
                <button type="button" onClick={() => removeJob(job)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button type="submit" className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700">保存修改</button>
    </form>
  )
}

export default function AdminRecruitment() {
  return (
    <EditorShell contentKey="recruitment" title="人才招聘" subtitle="招聘页面与职位管理" renderForm={(props) => <RecruitmentForm {...props} />} onDataExtract={(data) => data} />
  )
}
