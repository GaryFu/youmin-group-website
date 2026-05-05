import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', title, onClose }) {
  const [visible, setVisible] = useState(false)
  const isSuccess = type === 'success'
  const heading = title || (isSuccess ? '操作成功' : '操作失败')

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 top-5 z-[100] flex w-[min(420px,calc(100vw-2rem))] items-start justify-center gap-3 rounded-2xl border px-5 py-4 text-base shadow-2xl ring-1 transition-all duration-300 ${
        visible ? '-translate-x-1/2 translate-y-0 opacity-100 scale-100' : '-translate-x-1/2 -translate-y-2 opacity-0 scale-95'
      } ${
        isSuccess
          ? 'border-green-200 bg-green-50 text-green-900 ring-green-500/10'
          : 'border-red-200 bg-red-50 text-red-900 ring-red-500/10'
      }`}
    >
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isSuccess ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
        {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      </div>
      <div className="min-w-0 flex-1 text-center">
        <p className="font-semibold leading-6">{heading}</p>
        <p className={`${isSuccess ? 'text-green-800' : 'text-red-800'} mt-0.5 text-[15px] leading-6`}>{message}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        className={`${isSuccess ? 'text-green-700 hover:bg-green-100' : 'text-red-700 hover:bg-red-100'} -mr-1 -mt-1 rounded-lg p-1 transition-colors`}
        aria-label="关闭提示"
      >
        <X size={16} />
      </button>
    </div>
  )
}
