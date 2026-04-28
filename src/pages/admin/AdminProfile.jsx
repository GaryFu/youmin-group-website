import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Shield, Mail, User, Lock } from 'lucide-react'

export default function AdminProfile() {
  const { user, updateUser } = useAuth()
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const payload = {}
    if (username && username !== user.username) payload.username = username
    if (email && email !== user.email) payload.email = email
    if (newPassword) {
      payload.currentPassword = currentPassword
      payload.newPassword = newPassword
    }

    if (Object.keys(payload).length === 0) {
      setError('没有需要更新的信息')
      setLoading(false)
      return
    }

    const result = await updateUser(payload)
    if (result.success) {
      setMessage('账号信息已更新')
      setCurrentPassword('')
      setNewPassword('')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">管理员账号设置</h2>
      <p className="text-sm text-gray-500 mb-6">修改用户名、邮箱或密码</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <hr className="border-gray-100" />
          <p className="text-sm text-gray-500">修改密码（选填）</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">当前密码</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">新密码</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="至少6位，不修改则不填"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>
  )
}
