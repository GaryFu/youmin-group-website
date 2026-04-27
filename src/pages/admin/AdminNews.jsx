import { deepClone } from '../../utils/deepClone'
import { useState, useEffect } from 'react'
import EditorShell from '../../components/admin/EditorShell'
import { Plus, Trash2 } from 'lucide-react'

function NewsForm({ data, onSave, resetKey }) {
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

  const updateArticle = (i, field) => (e) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.articles[i][field] = e.target.value
      return copy
    })
  }

  const addArticle = () => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.articles.push({ date: '', title: '', category: '集团新闻' })
      return copy
    })
  }

  const removeArticle = (i) => {
    setForm((f) => {
      const copy = deepClone(f)
      copy.articles.splice(i, 1)
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

      <div className="border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">新闻列表 ({form.articles?.length || 0} 条)</h3>
          <button type="button" onClick={addArticle} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
            <Plus size={16} /> 添加新闻
          </button>
        </div>
        <div className="space-y-3">
          {form.articles?.map((article, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="date" value={article.date} onChange={updateArticle(i, 'date')} className="w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <input type="text" value={article.title} onChange={updateArticle(i, 'title')} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="新闻标题" />
              <input type="text" value={article.category} onChange={updateArticle(i, 'category')} className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="分类" />
              <button type="button" onClick={() => removeArticle(i)} className="text-red-400 hover:text-red-600 shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {(!form.articles || form.articles.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-4">暂无新闻，点击"添加新闻"开始</p>
          )}
        </div>
      </div>

      <button type="submit" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
        保存修改
      </button>
    </form>
  )
}

export default function AdminNews() {
  return (
    <EditorShell
      contentKey="news"
      title="新闻动态"
      subtitle="新闻列表管理"
      renderForm={(props) => <NewsForm {...props} />}
      onDataExtract={(data) => data}
    />
  )
}
