import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Mail } from 'lucide-react'
import { post as apiPost } from '../../lib/api'

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const data = await apiPost('/auth/forgot-password', { email })
      setMessage(data.message)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/30">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">找回密码</h1>
          <p className="text-green-300 text-sm">输入注册邮箱，我们将发送重置链接</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {message ? (
            <div>
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
                {message}
              </div>
              <Link
                to="/admin/login"
                className="block text-center w-full bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
              >
                返回登录
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">找回密码</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱地址</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '发送中...' : '发送重置邮件'}
              </button>

              <div className="text-center mt-4">
                <Link to="/admin/login" className="text-sm text-green-600 hover:text-green-800 transition-colors">
                  返回登录
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
