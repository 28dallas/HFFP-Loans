export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 text-sm rounded-lg border
          bg-white text-text placeholder:text-muted
          transition-all duration-150 outline-none
          ${error
            ? 'border-danger focus:ring-2 focus:ring-danger/30'
            : 'border-slate-200 focus:ring-2 focus:ring-accent/30 focus:border-accent'
          }
          disabled:bg-slate-50 disabled:text-muted disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-text">{label}</label>}
      <textarea
        rows={3}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border resize-none
          bg-white text-text placeholder:text-muted
          transition-all duration-150 outline-none
          ${error
            ? 'border-danger focus:ring-2 focus:ring-danger/30'
            : 'border-slate-200 focus:ring-2 focus:ring-accent/30 focus:border-accent'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
