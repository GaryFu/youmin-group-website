import { useState, useCallback } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { useContent } from '../../context/ContentContext'
import Toast from './Toast'

export default function EditorShell({ contentKey, title, subtitle, renderForm, onDataExtract }) {
  const { getContent, updateContent, resetContent } = useContent()
  const [toast, setToast] = useState(null)
  const [resetKey, setResetKey] = useState(0)

  const currentData = getContent(contentKey)

  const handleSave = useCallback(async (formData) => {
    try {
      const extracted = onDataExtract ? onDataExtract(formData) : formData
      await updateContent(contentKey, extracted)
      setToast({ message: '保存成功', type: 'success' })
    } catch (err) {
      setToast({ message: err.message || '保存失败', type: 'error' })
    }
  }, [contentKey, updateContent, onDataExtract])

  const handleReset = useCallback(async () => {
    try {
      await resetContent(contentKey)
      setResetKey((k) => k + 1)
      setToast({ message: '已恢复默认内容', type: 'success' })
    } catch (err) {
      setToast({ message: err.message || '重置失败', type: 'error' })
    }
  }, [contentKey, resetContent])

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={16} /> 恢复默认
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        {renderForm({
          data: currentData,
          onSave: handleSave,
          resetKey,
        })}
      </div>
    </div>
  )
}
