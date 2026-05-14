import { AlertCircle, Trash2 } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatCurrency, formatDate, getOutstandingBalance, getLoanCalculation, isOverdue, getDaysOverdue } from '../../lib/utils'

export function LoanTable({ loans, onDelete }) {
  if (!loans?.length) {
    return (
      <div className="text-center py-12 text-muted text-sm">
        No loans found for this member.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {['Loan No.', 'Amount', 'Applied', 'Due Date', 'Interest', 'Status', 'Outstanding', 'Actions'].map((h) => (
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
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge status={loan.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">
                  <span className={outstanding > 0 ? 'text-danger' : 'text-success'}>
                    {formatCurrency(outstanding)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(loan)}
                    className="text-muted hover:text-danger p-1.5"
                  >
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
