import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-primary text-white hover:bg-[#162d4a] active:scale-[0.98]',
  accent: 'bg-accent text-white hover:bg-blue-700 active:scale-[0.98]',
  secondary: 'border border-slate-300 text-text bg-white hover:bg-slate-50 active:scale-[0.98]',
  danger: 'bg-danger text-white hover:bg-red-700 active:scale-[0.98]',
  ghost: 'text-muted hover:text-text hover:bg-slate-100 active:scale-[0.98]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}
