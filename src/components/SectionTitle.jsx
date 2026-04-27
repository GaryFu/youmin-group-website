export default function SectionTitle({ subtitle, title, children, light = false }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
      {subtitle && (
        <p className={`text-sm font-semibold tracking-widest uppercase mb-3 ${light ? 'text-green-300' : 'text-green-600'}`}>
          {subtitle}
        </p>
      )}
      <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${light ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>
      <div className={`w-16 h-1 mx-auto rounded-full mb-4 ${light ? 'bg-gold-400' : 'bg-green-600'}`} />
      {children && (
        <p className={`text-base lg:text-lg leading-relaxed ${light ? 'text-gray-300' : 'text-gray-500'}`}>
          {children}
        </p>
      )}
    </div>
  )
}
