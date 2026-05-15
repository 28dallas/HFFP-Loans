import { useEffect, useMemo, useState } from 'react'
import { Users, Banknote, Percent, CalendarDays, Plus, Search, Wallet } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { useLoans } from '../hooks/useLoans'
import { getOutstandingBalance, getLoanCalculation, formatCurrency } from '../lib/utils'
import { UserCard } from '../components/users/UserCard'
import { AddUserModal } from '../components/users/AddUserModal'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'
import { SystemReportActions } from '../components/ui/SystemReportActions'

const FILTERS = ['All', 'Active', 'Overdue', 'Paid']

function compareMembers(a, b, loanSummaryMap) {
  const aOutstanding = loanSummaryMap[a.id]?.outstanding ?? 0
  const bOutstanding = loanSummaryMap[b.id]?.outstanding ?? 0
  const aShares = Number(a.total_shares ?? 0)
  const bShares = Number(b.total_shares ?? 0)

  const aPriority = aShares > 0 && aOutstanding > 0 ? 1 : 0
  const bPriority = bShares > 0 && bOutstanding > 0 ? 1 : 0

  if (aPriority !== bPriority) return bPriority - aPriority
  if (aOutstanding !== bOutstanding) return bOutstanding - aOutstanding
  if (aShares !== bShares) return bShares - aShares
  return a.full_name.localeCompare(b.full_name)
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-muted font-medium">{label}</p>
        <p className="text-lg font-bold text-text font-mono leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [debounced, setDebounced] = useState('')

  const { data: users = [], isLoading: usersLoading } = useUsers()
  const { data: loans = [] } = useLoans()

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const totalInterestCharges = useMemo(
    () => loans.reduce((sum, loan) => sum + getLoanCalculation(loan).totalInterest, 0),
    [loans]
  )

  const totalDisbursed = useMemo(
    () => loans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0),
    [loans]
  )

  const totalShares = useMemo(
    () => users.reduce((sum, user) => sum + Number(user.total_shares || 0), 0),
    [users]
  )

  // Build per-user loan summary
  const loanSummaryMap = useMemo(() => {
    const map = {}
    for (const loan of loans) {
      if (!map[loan.user_id]) map[loan.user_id] = { outstanding: 0, activeCount: 0, statuses: [] }
      map[loan.user_id].outstanding += getOutstandingBalance(loan)
      map[loan.user_id].statuses.push(loan.status)
      if (loan.status === 'Active' || loan.status === 'Overdue') map[loan.user_id].activeCount++
    }
    return map
  }, [loans])

  const totalOutstanding = useMemo(
    () => Object.values(loanSummaryMap).reduce((sum, summary) => sum + summary.outstanding, 0),
    [loanSummaryMap]
  )

  const filtered = useMemo(() => {
    let result = users

    if (debounced) {
      const q = debounced.toLowerCase()
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.unique_no?.toLowerCase().includes(q)
      )
    }

    if (filter !== 'All') {
      result = result.filter((u) => {
        const summary = loanSummaryMap[u.id]
        return summary?.statuses?.includes(filter)
      })
    }

    return [...result].sort((a, b) => compareMembers(a, b, loanSummaryMap))
  }, [users, debounced, filter, loanSummaryMap])

  return (
    <PageWrapper>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Total Members"
          value={users.length}
          color="bg-primary"
        />
        <StatCard
          icon={Wallet}
          label="Main Account"
          value={formatCurrency(totalShares)}
          color="bg-emerald-600"
        />
        <StatCard
          icon={Banknote}
          label={`Total Disbursed (\${loans.length} loans)`}
          value={formatCurrency(totalDisbursed)}
          color="bg-accent"
        />
        <StatCard
          icon={Percent}
          label="Interest Charges"
          value={formatCurrency(totalInterestCharges)}
          color="bg-danger"
        />
        <StatCard
          icon={CalendarDays}
          label="Outstanding Balance"
          value={formatCurrency(totalOutstanding)}
          color="bg-success"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                ${filter === f
                  ? 'bg-primary text-white'
                  : 'bg-white border border-slate-200 text-muted hover:text-text hover:border-slate-300'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white
                focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>
          <Button onClick={() => setAddOpen(true)} size="md">
            <Plus size={15} />
            Add Member
          </Button>
          <SystemReportActions users={users} loans={loans} />
        </div>
      </div>

      {/* Grid */}
      {usersLoading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted text-sm">
          {debounced ? `No members found for "${debounced}"` : 'No members yet. Add your first member.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              loanSummary={loanSummaryMap[user.id]}
            />
          ))}
        </div>
      )}

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} />
    </PageWrapper>
  )
}
