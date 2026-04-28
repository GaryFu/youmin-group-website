import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Shield, Lock, Eye, EyeOff } from 'lucide-react'
import { post as apiPost } from '../../lib/api'

export default function AdminResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const data = await apiPost('/auth/reset-password', { token, newPassword })
      setMessage(data.message)
      setTimeout(() => navigate('/admin/login'), 2000)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            无效的重置链接，请重新申请密码重置。
          </div>
          <Link
            to="/admin/forgot-password"
            className="block w-full bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
          >
            重新申请
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/30">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">重置密码</h1>
          <p className="text-green-300 text-sm">请输入新密码</p>
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">设置新密码</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">新密码</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="至少6位"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '重置中...' : '重置密码'}
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
