export default function Card({ icon: Icon, title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl p-6 lg:p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-green-100/30 hover:border-green-100 transition-all duration-300 group ${className}`}>
      {Icon && (
        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
          <Icon className="text-green-600" size={24} />
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{children}</p>
    </div>
  )
}
