import { useNavigate } from 'react-router-dom'
import { MapPin, TrendingUp } from 'lucide-react'
import { getInitials, getAvatarColor, formatCurrency } from '../../lib/utils'

export function UserCard({ user, loanSummary }) {
  const navigate = useNavigate()
  const { outstanding = 0, activeCount = 0 } = loanSummary ?? {}

  return (
    <div
      onClick={() => navigate(`/users/${user.id}`)}
      className="bg-white rounded-xl border border-slate-100 p-5 cursor-pointer
        hover:shadow-md hover:border-slate-200 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${getAvatarColor(user.full_name)}`}
          >
            {getInitials(user.full_name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-text group-hover:text-accent transition-colors leading-tight">
              {user.full_name}
            </p>
            <p className="text-xs font-mono text-muted mt-0.5">{user.unique_no}</p>
          </div>
        </div>
        {activeCount > 0 && (
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2 py-0.5">
            {activeCount} active
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        <MapPin size={12} className="text-muted shrink-0" />
        <span className="text-xs text-muted truncate">{user.ground}</span>
      </div>

      <div className="pt-3 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Outstanding</span>
          <span
            className={`text-sm font-semibold font-mono ${
              outstanding > 0 ? 'text-danger' : 'text-success'
            }`}
          >
            {formatCurrency(outstanding)}
          </span>
        </div>
        {user.total_shares > 0 && (
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-muted flex items-center gap-1">
              <TrendingUp size={11} /> Shares
            </span>
            <span className="text-xs font-mono text-muted">
              {formatCurrency(user.total_shares)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
