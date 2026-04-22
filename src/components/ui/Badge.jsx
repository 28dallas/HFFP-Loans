const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Active: 'bg-blue-50 text-blue-700 border border-blue-200',
  Paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Overdue: 'bg-red-50 text-red-700 border border-red-200',
}

export function Badge({ status, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
        ${statusStyles[status] ?? 'bg-slate-100 text-slate-600 border border-slate-200'}
        ${className}
      `}
    >
      {status}
    </span>
  )
}
