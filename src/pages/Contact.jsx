import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import { contactContent } from '../data/content'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{contactContent.subtitle}</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{contactContent.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="欢迎与我们联系">
            {contactContent.intro}
          </SectionTitle>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-5xl mx-auto mt-8">
            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              <ScrollReveal>
                <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-4">联系方式</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">集团地址</div>
                        <div className="text-gray-500 text-sm">{contactContent.info.address}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={20} className="text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">服务热线</div>
                        <div className="text-gray-500 text-sm">{contactContent.info.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail size={20} className="text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">电子邮箱</div>
                        <div className="text-gray-500 text-sm">{contactContent.info.email}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={20} className="text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">工作时间</div>
                        <div className="text-gray-500 text-sm">{contactContent.info.hours}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-900 mb-2">提交成功</h3>
                    <p className="text-green-700 text-sm">感谢您的留言，我们将尽快与您联系。</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-lg shadow-gray-200/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">姓名</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                          placeholder="请输入姓名"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">手机号</label>
                        <input
                          type="tel"
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                          placeholder="请输入手机号"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">公司名称</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                        placeholder="请输入公司名称（选填）"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">咨询类型</label>
                      <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow bg-white">
                        <option>产品咨询</option>
                        <option>技术合作</option>
                        <option>供应链合作</option>
                        <option>品牌合作</option>
                        <option>其他</option>
                      </select>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">留言内容</label>
                      <textarea
                        required
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow resize-none"
                        placeholder="请输入您的咨询内容..."
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center">
                      <Send size={18} /> 提交留言
                    </button>
                  </form>
                )}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
