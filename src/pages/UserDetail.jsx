import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, MapPin, CreditCard, TrendingUp, Pencil, Trash2, Plus } from 'lucide-react'
import { useUser, useDeleteUser } from '../hooks/useUsers'
import { useUserLoans, useDeleteLoan } from '../hooks/useLoans'
import { getInitials, getAvatarColor, formatCurrency, maskIdNumber, getOutstandingBalance } from '../lib/utils'
import { PageWrapper } from '../components/layout/PageWrapper'
import { LoanTable } from '../components/loans/LoanTable'
import { NewLoanModal } from '../components/loans/NewLoanModal'
import { EditUserModal } from '../components/users/EditUserModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Button } from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'

function StatCard({ label, value, color = 'text-text' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <p className="text-xs text-muted font-medium mb-1">{label}</p>
      <p className={`text-base font-bold font-mono ${color}`}>{value}</p>
    </div>
  )
}

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: user, isLoading: userLoading } = useUser(id)
  const { data: loans = [], isLoading: loansLoading } = useUserLoans(id)
  const { mutateAsync: deleteUser, isPending: deletingUser } = useDeleteUser()
  const { mutateAsync: deleteLoan, isPending: deletingLoan } = useDeleteLoan()

  const [editOpen, setEditOpen] = useState(false)
  const [newLoanOpen, setNewLoanOpen] = useState(false)
  const [deleteUserOpen, setDeleteUserOpen] = useState(false)
  const [deleteLoanTarget, setDeleteLoanTarget] = useState(null)

  if (userLoading) return <PageWrapper><PageSpinner /></PageWrapper>
  if (!user) return <PageWrapper><p className="text-muted text-sm">Member not found.</p></PageWrapper>

  const totalBorrowed = loans.reduce((s, l) => s + Number(l.amount), 0)
  const totalPaid = loans.reduce((s, l) => s + Number(l.amount_paid), 0)
  const totalOutstanding = loans.reduce((s, l) => s + getOutstandingBalance(l), 0)

  async function handleDeleteUser() {
    await deleteUser(id)
    navigate('/')
  }

  async function handleDeleteLoan() {
    if (!deleteLoanTarget) return
    await deleteLoan(deleteLoanTarget.id)
    setDeleteLoanTarget(null)
  }

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted hover:text-text mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Profile Card ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-100 p-6 sticky top-6">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 ${getAvatarColor(user.full_name)}`}
                >
                  {getInitials(user.full_name)}
                </div>
                <h2 className="text-base font-bold text-text">{user.full_name}</h2>
                <p className="text-xs font-mono text-muted mt-0.5">{user.unique_no}</p>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-3 text-sm mb-6">
                <div className="flex items-center gap-2.5 text-muted">
                  <Phone size={14} className="shrink-0" />
                  <span>{user.phone_number}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted">
                  <CreditCard size={14} className="shrink-0" />
                  <span className="font-mono">{maskIdNumber(user.id_number)}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted">
                  <MapPin size={14} className="shrink-0" />
                  <span>{user.ground}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted">
                  <TrendingUp size={14} className="shrink-0" />
                  <span className="font-mono">{formatCurrency(user.total_shares)}</span>
                  <span className="text-xs">shares</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)} className="w-full justify-center gap-2">
                  <Pencil size={13} /> Edit Member
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteUserOpen(true)} className="w-full justify-center gap-2">
                  <Trash2 size={13} /> Delete Member
                </Button>
              </div>
            </div>
          </div>

          {/* ── Right: Financial Overview ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total Borrowed" value={formatCurrency(totalBorrowed)} />
              <StatCard label="Total Paid" value={formatCurrency(totalPaid)} color="text-success" />
              <StatCard
                label="Remaining Balance"
                value={formatCurrency(totalOutstanding)}
                color={totalOutstanding > 0 ? 'text-danger' : 'text-success'}
              />
            </div>

            {/* Loan History */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text">Loan History</h3>
                <Button size="sm" onClick={() => setNewLoanOpen(true)}>
                  <Plus size={13} /> New Loan
                </Button>
              </div>
              {loansLoading ? <PageSpinner /> : (
                <LoanTable loans={loans} onDelete={setDeleteLoanTarget} />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <EditUserModal open={editOpen} onClose={() => setEditOpen(false)} user={user} />
      <NewLoanModal open={newLoanOpen} onClose={() => setNewLoanOpen(false)} userId={id} />

      <ConfirmDialog
        open={deleteUserOpen}
        onClose={() => setDeleteUserOpen(false)}
        onConfirm={handleDeleteUser}
        loading={deletingUser}
        title="Delete Member"
        description="This will permanently delete this member and all associated loans. This action cannot be undone."
        confirmText={user.full_name}
      />

      <ConfirmDialog
        open={!!deleteLoanTarget}
        onClose={() => setDeleteLoanTarget(null)}
        onConfirm={handleDeleteLoan}
        loading={deletingLoan}
        title="Delete Loan"
        description="This will permanently delete this loan record."
        confirmText={deleteLoanTarget?.loan_number ?? ''}
      />
    </PageWrapper>
  )
}
