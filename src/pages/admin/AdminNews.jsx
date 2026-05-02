import { useState, useEffect, useCallback } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import Toast from '../../components/admin/Toast'
import { Search, X, Plus, Trash2, Edit3, Newspaper, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react'

const PAGE_SIZE = 20

function ArticleEditor({ article, categories, onSave, onCancel }) {
  const [form, setForm] = useState({ ...article })

  useEffect(() => { setForm({ ...article }) }, [article])

  const setField = (f, v) => setForm((p) => ({ ...p, [f]: v }))

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-gray-900">{form.id ? '编辑文章' : '新增文章'}</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-xs text-gray-500 mb-1">标题</label><input type="text" value={form.title || ''} onChange={(e) => setField('title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">日期</label><input type="date" value={form.date || ''} onChange={(e) => setField('date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">分类</label><input type="text" value={form.category || '集团新闻'} onChange={(e) => setField('category', e.target.value)} list="news-categories" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <datalist id="news-categories">{(categories || []).map(c => <option key={c} value={c} />)}</datalist>
            </div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">摘要</label><textarea value={form.digest || ''} onChange={(e) => setField('digest', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">链接</label><input type="text" value={form.url || ''} onChange={(e) => setField('url', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => onSave(form)} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700">保存</button>
            <button onClick={onCancel} className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewsList() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchArticles = useCallback(async (p, s, cat) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) })
      if (s) params.set('search', s)
      if (cat) params.set('category', cat)
      const res = await fetch(`/api/news?${params}`)
      const data = await res.json()
      if (res.ok) {
        setArticles(data.articles)
        setCategories(data.categories)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        setPage(data.page)
      }
    } catch (err) { console.error('Failed:', err) }
    setLoading(false)
  }, [])

  useEffect(() => { fetchArticles(page, search, filterCat) }, [page])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchArticles(1, search, filterCat) }
  const handleFilter = (cat) => { setFilterCat(cat); setPage(1); fetchArticles(1, search, cat) }

  const handleSave = async (formData) => {
    const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` }
    const isNew = !formData.id
    const res = await fetch(isNew ? '/api/news' : `/api/news/${formData.id}`, {
      method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify(formData),
    })
    if (res.ok) { setEditing(null); setToast({ message: isNew ? '创建成功' : '保存成功', type: 'success' }); fetchArticles(page, search, filterCat) }
    else { const d = await res.json(); setToast({ message: d.error || '保存失败', type: 'error' }) }
  }

  const handleDelete = async (article) => {
    if (!confirm(`确定删除「${article.title}」？`)) return
    const token = JSON.parse(localStorage.getItem('youmin_admin_auth') || '{}').token
    const res = await fetch(`/api/news/${article.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token || ''}` } })
    if (res.ok) { setToast({ message: '已删除', type: 'success' }); fetchArticles(page, search, filterCat) }
    else { setToast({ message: '删除失败', type: 'error' }) }
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索文章标题..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </form>
        <select value={filterCat} onChange={(e) => handleFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">全部分类</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-xs text-gray-400">共 {total} 篇</span>
        <button onClick={() => setEditing({ date: new Date().toISOString().slice(0, 10), category: '集团新闻', title: '', digest: '', url: '' })} className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1.5">
          <PlusCircle size={16} /> 新增文章
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm">加载中...</p></div>
        ) : articles.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400"><Newspaper size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">没有找到文章</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {articles.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-xs text-gray-400 w-24 shrink-0">{a.date}</span>
                <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded shrink-0">{a.category}</span>
                <span className="flex-1 text-sm text-gray-900 truncate">{a.title}</span>
                <button onClick={() => setEditing(a)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(a)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={() => fetchArticles(page - 1, search, filterCat)} disabled={page <= 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={18} /></button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let p; if (totalPages <= 7) p = i + 1; else if (page <= 4) p = i + 1; else if (page >= totalPages - 3) p = totalPages - 6 + i; else p = page - 3 + i
            return <button key={p} onClick={() => fetchArticles(p, search, filterCat)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-green-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
          })}
          <button onClick={() => fetchArticles(page + 1, search, filterCat)} disabled={page >= totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
      )}

      {editing && <ArticleEditor article={editing} categories={categories} onSave={handleSave} onCancel={() => setEditing(null)} />}
    </div>
  )
}

export default function AdminNews() {
  return (
    <EditorShell contentKey="news" title="新闻动态" subtitle="文章管理" renderForm={() => <NewsList />} onDataExtract={(data) => data} />
  )
}
