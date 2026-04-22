import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Plus, Users, MapPin, TrendingUp } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { useLoans } from '../hooks/useLoans'
import { getInitials, getAvatarColor, formatCurrency, maskIdNumber, getOutstandingBalance } from '../lib/utils'
import { PageWrapper } from '../components/layout/PageWrapper'
import { AddUserModal } from '../components/users/AddUserModal'
import { Button } from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'

const GROUND_COLORS = {
  'KAPROMTIN':  'bg-violet-50 text-violet-700 border-violet-200',
  'KODUWEN':    'bg-blue-50 text-blue-700 border-blue-200',
  'MARICHOR G': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'SOKOROMWC':  'bg-amber-50 text-amber-700 border-amber-200',
  'CHE PROPOG': 'bg-rose-50 text-rose-700 border-rose-200',
}

function groundColor(ground) {
  return GROUND_COLORS[ground] ?? 'bg-slate-50 text-slate-600 border-slate-200'
}

export default function Members() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [activeGround, setActiveGround] = useState('All')

  const { data: users = [], isLoading } = useUsers()
  const { data: loans = [] } = useLoans()

  const grounds = useMemo(() => {
    const set = new Set(users.map((u) => u.ground))
    return ['All', ...Array.from(set)]
  }, [users])

  const loanMap = useMemo(() => {
    const map = {}
    for (const loan of loans) {
      if (!map[loan.user_id]) map[loan.user_id] = { outstanding: 0, loans: [] }
      map[loan.user_id].outstanding += getOutstandingBalance(loan)
      map[loan.user_id].loans.push(loan)
    }
    return map
  }, [loans])

  const filtered = useMemo(() => {
    let result = users
    if (activeGround !== 'All') result = result.filter((u) => u.ground === activeGround)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.unique_no?.toLowerCase().includes(q) ||
          u.ground?.toLowerCase().includes(q)
      )
    }
    return result
  }, [users, activeGround, search])

  const totalShares = filtered.reduce((s, u) => s + Number(u.total_shares ?? 0), 0)
  const totalOutstanding = filtered.reduce((s, u) => s + (loanMap[u.id]?.outstanding ?? 0), 0)

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-text">Members Registry</h1>
            <p className="text-sm text-muted mt-0.5">HFFP Loan Disbursement — Cycle One</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={15} /> Add Member
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted">Total Members</p>
              <p className="text-xl font-bold text-text font-mono">{filtered.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-success" />
            </div>
            <div>
              <p className="text-xs text-muted">Total Shares</p>
              <p className="text-xl font-bold text-text font-mono">KES 80,000.00</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center">
              <MapPin size={16} className="text-danger" />
            </div>
            <div>
              <p className="text-xs text-muted">Outstanding</p>
              <p className="text-xl font-bold text-danger font-mono">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {grounds.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGround(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                  ${activeGround === g
                    ? 'bg-primary text-white'
                    : 'bg-white border border-slate-200 text-muted hover:text-text'
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white
                focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <PageSpinner />
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['S/N', 'Member', 'Unique No.', 'Ground', 'Phone', 'ID No.', 'Shares', 'Outstanding'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((user, i) => {
                    const outstanding = loanMap[user.id]?.outstanding ?? 0
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-3 text-xs text-muted font-mono">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(user.full_name)}`}>
                              {getInitials(user.full_name)}
                            </div>
                            <span className="font-medium text-text group-hover:text-accent transition-colors whitespace-nowrap">
                              {user.full_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded-md">
                            {user.unique_no}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${groundColor(user.ground)}`}>
                            {user.ground}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap">
                          {user.phone_number}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap">
                          {maskIdNumber(user.id_number)}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono font-medium text-success whitespace-nowrap">
                          {formatCurrency(user.total_shares)}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono font-semibold whitespace-nowrap">
                          <span className={outstanding > 0 ? 'text-danger' : 'text-success'}>
                            {formatCurrency(outstanding)}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
                {/* Totals Row */}
                {filtered.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={6} className="px-4 py-3 text-xs font-bold text-text uppercase tracking-wide">
                        Total ({filtered.length} members)
                      </td>
                      <td className="px-4 py-3 text-xs font-bold font-mono text-success whitespace-nowrap">
                        KES 80,000.00
                      </td>
                      <td className="px-4 py-3 text-xs font-bold font-mono text-danger whitespace-nowrap">
                        {formatCurrency(totalOutstanding)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted text-sm">
                No members found.
              </div>
            )}
          </div>
        )}
      </motion.div>

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} />
    </PageWrapper>
  )
}
