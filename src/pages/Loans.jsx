import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { AlertCircle, Search } from 'lucide-react'
import { useLoans } from '../hooks/useLoans'
import { useUsers } from '../hooks/useUsers'
import { formatCurrency, formatDate, getOutstandingBalance, getDaysOverdue } from '../lib/utils'

import { Badge } from '../components/ui/Badge'
import { PageWrapper } from '../components/layout/PageWrapper'
import { PageSpinner } from '../components/ui/Spinner'

const TABS = ['All', 'Pending', 'Active', 'Overdue', 'Paid']

export default function Loans() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')

  const { data: loans = [], isLoading } = useLoans()
  const { data: users = [] } = useUsers()

  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users])

  const filtered = useMemo(() => {
    let result = loans
    if (tab !== 'All') result = result.filter((l) => l.status === tab)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((l) =>
        l.loan_number?.toLowerCase().includes(q) ||
        userMap[l.user_id]?.full_name?.toLowerCase().includes(q) ||
        userMap[l.user_id]?.unique_no?.toLowerCase().includes(q)
      )
    }
    return result
  }, [loans, tab, search, userMap])

  const overdueCount = useMemo(() => loans.filter((l) => l.status === 'Overdue').length, [loans])
  const totalOutstanding = useMemo(() => loans.reduce((s, l) => s + getOutstandingBalance(l), 0), [loans])
  const totalDisbursed = useMemo(() => loans.reduce((s, l) => s + Number(l.amount), 0), [loans])

  return (
    <PageWrapper>
      <Motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="mb-6">
          <h1 className="text-lg font-bold text-text">Loans</h1>
          <p className="text-sm text-muted mt-0.5">All loan records across all members</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-muted">Total Loans</p>
            <p className="text-xl font-bold font-mono text-text">{loans.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-muted">Total Disbursed</p>
            <p className="text-xl font-bold font-mono text-accent">{formatCurrency(totalDisbursed)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-muted">Outstanding</p>
            <p className="text-xl font-bold font-mono text-danger">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>

        {overdueCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-danger font-medium">
            <AlertCircle size={15} />
            {overdueCount} loan{overdueCount > 1 ? 's are' : ' is'} overdue — immediate follow-up required.
          </div>
        )}

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                  ${tab === t ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-muted hover:text-text'}`}
              >
                {t}
                {t === 'Overdue' && overdueCount > 0 && (
                  <span className="ml-1.5 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {overdueCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search loans..."
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
                    {['Loan No.', 'Member', 'Amount', 'Applied', 'Due Date', 'Paid', 'Outstanding', 'Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((loan) => {
                    const user = userMap[loan.user_id]
                    const outstanding = getOutstandingBalance(loan)
                    const daysOver = loan.status === 'Overdue' ? getDaysOverdue(loan.due_date) : 0

                    return (
                      <tr
                        key={loan.id}
                        onClick={() => user && navigate(`/users/${loan.user_id}`)}
                        className={`cursor-pointer transition-colors ${loan.status === 'Overdue' ? 'bg-red-50/40 border-l-2 border-l-danger' : 'hover:bg-slate-50/60'}`}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-medium text-text whitespace-nowrap">{loan.loan_number}</td>
                        <td className="px-4 py-3 text-xs text-text whitespace-nowrap">
                          <p className="font-medium">{user?.full_name ?? '—'}</p>
                          <p className="text-muted font-mono">{user?.unique_no ?? ''}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{formatCurrency(loan.amount)}</td>
                        <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{formatDate(loan.application_date)}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          <span className={loan.status === 'Overdue' ? 'text-danger font-medium' : 'text-muted'}>
                            {formatDate(loan.due_date)}
                          </span>
                          {daysOver > 0 && <p className="text-[11px] text-danger/70">{daysOver}d overdue</p>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-success whitespace-nowrap">{formatCurrency(loan.amount_paid)}</td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">
                          <span className={outstanding > 0 ? 'text-danger' : 'text-success'}>{formatCurrency(outstanding)}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap"><Badge status={loan.status} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted text-sm">No loans found.</div>
            )}
          </div>
        )}
      </Motion.div>
    </PageWrapper>
  )
}
