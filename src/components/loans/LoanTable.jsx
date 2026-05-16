import { useState } from 'react'
import { AlertCircle, Trash2, Pencil, CheckCircle, XCircle, CreditCard, CheckCheck } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatCurrency, formatDate, getOutstandingBalance, getLoanCalculation, isOverdue, getDaysOverdue } from '../../lib/utils'
import { useUpdateLoan } from '../../hooks/useLoans'
import { EditLoanModal } from './EditLoanModal'
import { RecordRepaymentModal } from './RecordRepaymentModal'

export function LoanTable({ loans, onDelete, userId }) {
  const { mutateAsync: updateLoan } = useUpdateLoan()
  const [editTarget, setEditTarget] = useState(null)
  const [repaymentTarget, setRepaymentTarget] = useState(null)

  if (!loans?.length) {
    return (
      <div className="text-center py-12 text-muted text-sm">
        No loans found for this member.
      </div>
    )
  }

  async function handleApprove(loan) {
    await updateLoan({ id: loan.id, status: 'Active' })
  }

  async function handleReject(loan) {
    await updateLoan({ id: loan.id, status: 'Overdue' })
  }

  async function handleMarkPaid(loan) {
    const calc = getLoanCalculation(loan)
    await updateLoan({ id: loan.id, status: 'Paid', amount_paid: calc.totalRepayable })
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Loan No.', 'Amount', 'Applied', 'Due Date', 'Interest', 'Paid', 'Status', 'Outstanding', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loans.map((loan) => {
              const overdue = isOverdue(loan.due_date, loan.status)
              const outstanding = getOutstandingBalance(loan)
              const calculation = getLoanCalculation(loan)
              const daysOver = overdue ? getDaysOverdue(loan.due_date) : 0

              const paymentNote = loan.amount_paid > 0
                ? outstanding > 0
                  ? `Repaid ${formatCurrency(loan.amount_paid)} · Remaining ${formatCurrency(outstanding)}`
                  : `Repaid ${formatCurrency(loan.amount_paid)} and fully settled`
                : null

              return (
                <tr
                  key={loan.id}
                  className={`transition-colors ${
                    overdue ? 'bg-red-50/60 border-l-2 border-l-danger' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-text font-medium whitespace-nowrap">
                    {loan.loan_number}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {formatCurrency(loan.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                    {formatDate(loan.application_date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {overdue && <AlertCircle size={13} className="text-danger shrink-0" />}
                      <span className={`text-xs ${overdue ? 'text-danger font-medium' : 'text-muted'}`}>
                        {formatDate(loan.due_date)}
                      </span>
                    </div>
                    {overdue && daysOver > 0 && (
                      <p className="text-xs text-danger/70 mt-0.5">{daysOver}d overdue</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap">
                    {formatCurrency(calculation.totalInterest)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-success whitespace-nowrap">
                    {formatCurrency(loan.amount_paid)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge status={loan.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">
                    <span className={outstanding > 0 ? 'text-danger' : 'text-success'}>
                      {formatCurrency(outstanding)}
                    </span>
                    {paymentNote && (
                      <p className="text-[11px] text-muted mt-1">{paymentNote}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {loan.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(loan)}
                            title="Approve"
                            className="p-1.5 rounded text-success hover:bg-success/10 transition-colors"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleReject(loan)}
                            title="Reject"
                            className="p-1.5 rounded text-danger hover:bg-danger/10 transition-colors"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      {(loan.status === 'Active' || loan.status === 'Overdue') && (
                        <>
                          <button
                            onClick={() => setRepaymentTarget(loan)}
                            title="Record Repayment"
                            className="p-1.5 rounded text-accent hover:bg-accent/10 transition-colors"
                          >
                            <CreditCard size={14} />
                          </button>
                          <button
                            onClick={() => handleMarkPaid(loan)}
                            title="Mark as Paid"
                            className="p-1.5 rounded text-success hover:bg-success/10 transition-colors"
                          >
                            <CheckCheck size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setEditTarget(loan)}
                        title="Edit Loan"
                        className="p-1.5 rounded text-muted hover:text-text hover:bg-slate-100 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(loan)}
                        title="Delete Loan"
                        className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <EditLoanModal open={!!editTarget} onClose={() => setEditTarget(null)} loan={editTarget} />
      <RecordRepaymentModal
        open={!!repaymentTarget}
        onClose={() => setRepaymentTarget(null)}
        loan={repaymentTarget}
        userId={userId}
      />
    </>
  )
}
