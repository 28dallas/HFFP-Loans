import { useState, useMemo } from 'react'
import { motion as Motion } from 'framer-motion'
import { Search, ShieldCheck } from 'lucide-react'
import { useAuditLog } from '../hooks/useAuditLog'
import { PageWrapper } from '../components/layout/PageWrapper'
import { PageSpinner } from '../components/ui/Spinner'
import { formatDate } from '../lib/utils'
import { format, parseISO } from 'date-fns'

const ACTION_COLORS = {
  CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
  APPROVE: 'bg-violet-50 text-violet-700 border-violet-200',
  REJECT: 'bg-amber-50 text-amber-700 border-amber-200',
}

function actionColor(action) {
  const key = Object.keys(ACTION_COLORS).find((k) => action?.toUpperCase().includes(k))
  return ACTION_COLORS[key] ?? 'bg-slate-50 text-slate-600 border-slate-200'
}

export default function AuditLog() {
  const { data: logs = [], isLoading } = useAuditLog()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return logs
    const q = search.toLowerCase()
    return logs.filter((l) =>
      l.admin_email?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.entity?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q)
    )
  }, [logs, search])

  return (
    <PageWrapper>
      <Motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck size={16} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text">Audit Log</h1>
              <p className="text-sm text-muted">Track all admin actions</p>
            </div>
          </div>
          <div className="relative w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>
        </div>

        {isLoading ? <PageSpinner /> : (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Time', 'Admin', 'Action', 'Entity', 'Details'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap font-mono">
                        {log.created_at ? format(parseISO(log.created_at), 'd MMM yyyy, HH:mm') : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-text whitespace-nowrap">{log.admin_email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${actionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{log.entity}</td>
                      <td className="px-4 py-3 text-xs text-muted max-w-xs truncate">{log.details ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted text-sm">No audit entries found.</div>
            )}
          </div>
        )}
      </Motion.div>
    </PageWrapper>
  )
}
