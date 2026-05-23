import { Briefcase, MapPin, Phone, Mail, Users, Building2 } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useContent } from '../context/ContentContext'

export default function Recruitment() {
  const { getContent } = useContent()
  const recruitment = getContent('recruitment')
  const jobs = (recruitment.jobs || []).filter((job) => job.active !== false)

  return (
    <div>
      <section className="bg-gradient-to-r from-green-800 to-green-900 pt-20 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-3">{recruitment.subtitle}</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">{recruitment.title}</h1>
            <div className="w-16 h-1 mx-auto bg-gold-400 rounded-full" />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <Briefcase size={34} className="mx-auto mb-4 text-green-600" />
              <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed">{recruitment.intro}</p>
            </div>
          </ScrollReveal>

          {jobs.length > 0 ? (
            <div className="space-y-6">
              {jobs.map((job) => (
                <ScrollReveal key={job.id}>
                  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-green-200 hover:shadow-md">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                          {job.department && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-green-700"><Building2 size={12} /> {job.department}</span>}
                          {job.location && <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1"><MapPin size={12} /> {job.location}</span>}
                          {job.type && <span className="rounded-full bg-gray-50 px-3 py-1">{job.type}</span>}
                          {job.headcount && <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1"><Users size={12} /> {job.headcount}</span>}
                        </div>
                      </div>
                      <a href={`mailto:${recruitment.contact?.email || ''}`} className="inline-flex shrink-0 items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700">
                        投递简历
                      </a>
                    </div>

                    {job.summary && <p className="mt-5 text-sm leading-7 text-gray-600">{job.summary}</p>}

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-sm font-bold text-gray-900">岗位职责</h3>
                        <ul className="space-y-2 text-sm leading-6 text-gray-600">
                          {(job.responsibilities || []).map((item, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />{item}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h3 className="mb-2 text-sm font-bold text-gray-900">任职要求</h3>
                        <ul className="space-y-2 text-sm leading-6 text-gray-600">
                          {(job.requirements || []).map((item, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold-500 shrink-0" />{item}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-gray-50 py-16 text-center text-gray-400">暂无在招岗位</div>
          )}

          <ScrollReveal>
            <div className="mt-10 rounded-xl border border-green-100 bg-green-50 p-6">
              <h2 className="mb-4 text-lg font-bold text-green-900">投递方式</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3 text-sm text-green-900"><Mail size={18} className="mt-0.5 text-green-600" /><span>{recruitment.contact?.email}</span></div>
                <div className="flex items-start gap-3 text-sm text-green-900"><Phone size={18} className="mt-0.5 text-green-600" /><span>{recruitment.contact?.phone}</span></div>
                <div className="flex items-start gap-3 text-sm text-green-900"><MapPin size={18} className="mt-0.5 text-green-600" /><span>{recruitment.contact?.address}</span></div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
