import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { ArrowLeft, Phone, MapPin, CreditCard, TrendingUp, Pencil, Trash2, Plus, BadgeCheck, PiggyBank, Wallet, Calculator, CalendarDays, Globe2, Mailbox, UserRound, Heart } from 'lucide-react'
import { useUser, useDeleteUser } from '../hooks/useUsers'
import { useUserLoans, useDeleteLoan } from '../hooks/useLoans'
import { getInitials, getAvatarColor, formatCurrency, formatDate, maskIdNumber, getOutstandingBalance, getLoanCalculation, STANDARD_LOAN_TERMS } from '../lib/utils'
import { getMemberSavingsRecord } from '../lib/memberSavings'
import { PageWrapper } from '../components/layout/PageWrapper'
import { LoanTable } from '../components/loans/LoanTable'
import { NewLoanModal } from '../components/loans/NewLoanModal'
import { EditUserModal } from '../components/users/EditUserModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Button } from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'
import { ReportActions } from '../components/ui/ReportActions'

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
  const totalOutstanding = loans.reduce((s, l) => s + getOutstandingBalance(l, user.unique_no), 0)
  const referenceLoan = loans.find((loan) => loan.status === 'Active' || loan.status === 'Overdue') ?? loans[0] ?? null
  const savingsRecord = getMemberSavingsRecord(user)
  const savingsBalance = Number(savingsRecord?.totalSavings ?? 0)
  const loanCalculation = referenceLoan ? getLoanCalculation(referenceLoan, user.unique_no) : null

  const depositRows = [
    {
      label: 'Savings',
      amount: savingsBalance,
      description: savingsBalance > 0 ? 'Imported from savings register' : 'No matched savings record yet',
    },
    {
      label: 'Loan Repayment',
      amount: totalPaid,
      description: totalPaid > 0 ? 'Captured from recorded loan payments' : 'No loan repayment deposits recorded yet',
    },
  ]

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
      <Motion.div
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
                {user.date_of_birth && (
                  <div className="flex items-center gap-2.5 text-muted">
                    <CalendarDays size={14} className="shrink-0" />
                    <span>{formatDate(user.date_of_birth)}</span>
                  </div>
                )}
                {user.nationality && (
                  <div className="flex items-center gap-2.5 text-muted">
                    <Globe2 size={14} className="shrink-0" />
                    <span>{user.nationality}</span>
                  </div>
                )}
                {user.postal_address && (
                  <div className="flex items-center gap-2.5 text-muted">
                    <Mailbox size={14} className="shrink-0" />
                    <span>{user.postal_address}</span>
                  </div>
                )}
                {user.gender && (
                  <div className="flex items-center gap-2.5 text-muted">
                    <UserRound size={14} className="shrink-0" />
                    <span>{user.gender}</span>
                  </div>
                )}
                {user.marital_status && (
                  <div className="flex items-center gap-2.5 text-muted">
                    <Heart size={14} className="shrink-0" />
                    <span>{user.marital_status}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-muted">
                  <TrendingUp size={14} className="shrink-0" />
                  <span className="font-mono">{formatCurrency(user.total_shares)}</span>
                  <span className="text-xs">shares</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Savings Details</h3>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-muted">
                      <BadgeCheck size={14} className="shrink-0 text-success" />
                      <span>Registration Fee</span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Paid
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-muted">
                      <PiggyBank size={14} className="shrink-0" />
                      <span>Savings Account</span>
                    </div>
                    <span className="font-mono text-text font-semibold">{formatCurrency(savingsBalance)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white border border-slate-100 p-4 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Deposits</h3>
                <div className="flex flex-col gap-3">
                  {depositRows.map((row) => (
                    <div key={row.label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 text-sm font-medium text-text">
                          <Wallet size={14} className="text-accent shrink-0" />
                          <span>{row.label}</span>
                        </div>
                        <span className="font-mono text-sm font-semibold text-text">{formatCurrency(row.amount)}</span>
                      </div>
                      <p className="text-xs text-muted">{row.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white border border-slate-100 p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator size={14} className="text-accent shrink-0" />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Loan Calculations</h3>
                </div>

                {loanCalculation ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted mb-1">Loan Application Amount</p>
                        <p className="text-sm font-semibold text-text">{formatCurrency(loanCalculation.principal)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted mb-1">Interest Charges</p>
                        <p className="text-sm font-semibold text-text">{formatCurrency(loanCalculation.totalInterest)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted mb-1">Total Amount To Repay</p>
                        <p className="text-sm font-semibold text-text">{formatCurrency(loanCalculation.totalRepayable)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted mb-1">Total Amount To Receive</p>
                        <p className="text-sm font-semibold text-text">{formatCurrency(loanCalculation.netDisbursement)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3 md:col-span-2">
                        <p className="text-[11px] uppercase tracking-wide text-muted mb-1">Monthly Payment</p>
                        <p className="text-sm font-semibold text-text">{formatCurrency(loanCalculation.estimatedMonthlyInstallment)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted mb-1">Interest Method</p>
                        <p className="text-sm font-semibold text-text">
                          {loanCalculation.source === 'batch-sheet'
                            ? `${loanCalculation.batch} sheet`
                            : `${referenceLoan?.interest_rate ?? 1}% Reducing Balance`}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted mb-1">Repayment Period</p>
                        <p className="text-sm font-semibold text-text">{STANDARD_LOAN_TERMS.repaymentMonths} months</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted">Loan Principal</span>
                        <span className="font-mono font-semibold text-text">{formatCurrency(loanCalculation.principal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted">Processing Fee (2%)</span>
                        <span className="font-mono font-semibold text-danger">{formatCurrency(loanCalculation.processingFee)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted">Insurance Fee (1%)</span>
                        <span className="font-mono font-semibold text-danger">{formatCurrency(loanCalculation.insuranceFee)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted">Ledger Book</span>
                        <span className="font-mono font-semibold text-danger">{formatCurrency(loanCalculation.ledgerFee)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                        <span className="text-text font-medium">Net Disbursement</span>
                        <span className="font-mono font-bold text-accent">{formatCurrency(loanCalculation.netDisbursement)}</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted">Total Interest Over 6 Months</span>
                        <span className="font-mono font-semibold text-text">{formatCurrency(loanCalculation.totalInterest)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted">Total Repayable</span>
                        <span className="font-mono font-semibold text-text">{formatCurrency(loanCalculation.totalRepayable)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted">Estimated Monthly Installment</span>
                        <span className="font-mono font-semibold text-text">{formatCurrency(loanCalculation.estimatedMonthlyInstallment)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Estimated Outstanding</span>
                        <span className="font-mono font-bold text-danger">{formatCurrency(loanCalculation.estimatedOutstanding)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted">Create a loan for this member to see the reducing-balance calculation.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mb-6">
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)} className="w-full justify-center gap-2">
                  <Pencil size={13} /> Edit Member
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteUserOpen(true)} className="w-full justify-center gap-2">
                  <Trash2 size={13} /> Delete Member
                </Button>
              </div>

              {/* Report Actions */}
              <div className="border-t border-slate-100 pt-4">
                <ReportActions user={user} loans={loans} variant="compact" />
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
                <Button size="sm" onClick={() => setNewLoanOpen(true)} disabled={Number(user.total_shares || 0) <= 0}>
                  <Plus size={13} /> New Loan
                </Button>
              </div>
              {loansLoading ? <PageSpinner /> : (
                <LoanTable loans={loans} onDelete={setDeleteLoanTarget} />
              )}
            </div>
          </div>
        </div>
      </Motion.div>

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
