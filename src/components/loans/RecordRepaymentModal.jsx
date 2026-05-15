import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2 } from 'lucide-react'
import { useLoanRepayments, useCreateRepayment, useDeleteRepayment } from '../../hooks/useRepayments'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { formatCurrency, formatDate, getLoanCalculation } from '../../lib/utils'

const schema = z.object({
  amount: z.coerce.number({ invalid_type_error: 'Enter a valid amount' }).positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
})

export function RecordRepaymentModal({ open, onClose, loan, userId }) {
  const { data: repayments = [] } = useLoanRepayments(loan?.id)
  const { mutateAsync: createRepayment, isPending } = useCreateRepayment(loan?.id, userId)
  const { mutateAsync: deleteRepayment } = useDeleteRepayment(loan?.id, userId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  const calculation = loan ? getLoanCalculation(loan) : null
  const totalRepayable = calculation?.totalRepayable ?? 0
  const totalPaid = Number(loan?.amount_paid ?? 0)
  const outstanding = Math.max(totalRepayable - totalPaid, 0)

  async function onSubmit(data) {
    await createRepayment({ loanId: loan.id, userId, ...data })
    reset()
  }

  function handleClose() {
    reset()
    onClose()
  }

  if (!loan) return null

  return (
    <Modal open={open} onClose={handleClose} title={`Repayments — ${loan.loan_number}`} maxWidth="max-w-xl">
      <div className="flex flex-col gap-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
            <p className="text-[11px] text-muted uppercase tracking-wide">Total Repayable</p>
            <p className="text-sm font-bold font-mono text-text">{formatCurrency(totalRepayable)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
            <p className="text-[11px] text-muted uppercase tracking-wide">Total Paid</p>
            <p className="text-sm font-bold font-mono text-success">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
            <p className="text-[11px] text-muted uppercase tracking-wide">Outstanding</p>
            <p className={`text-sm font-bold font-mono ${outstanding > 0 ? 'text-danger' : 'text-success'}`}>
              {formatCurrency(outstanding)}
            </p>
          </div>
        </div>

        {/* Add repayment form */}
        {loan.status !== 'Paid' && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 border border-slate-100 rounded-xl p-4 bg-slate-50">
            <p className="text-xs font-semibold text-text uppercase tracking-wide">Record New Payment</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount (KES)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                error={errors.amount?.message}
                {...register('amount')}
              />
              <Input
                label="Date"
                type="date"
                error={errors.date?.message}
                {...register('date')}
              />
            </div>
            <Input
              label="Note (optional)"
              placeholder="e.g. Monthly installment"
              error={errors.note?.message}
              {...register('note')}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={isPending} size="sm">Record Payment</Button>
            </div>
          </form>
        )}

        {/* Repayment history */}
        <div>
          <p className="text-xs font-semibold text-text uppercase tracking-wide mb-2">Payment History</p>
          {repayments.length === 0 ? (
            <p className="text-xs text-muted">No payments recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
              {repayments.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2.5">
                  <div>
                    <p className="text-xs font-mono font-semibold text-text">{formatCurrency(r.amount)}</p>
                    <p className="text-[11px] text-muted">{formatDate(r.date)}{r.note ? ` — ${r.note}` : ''}</p>
                  </div>
                  <button
                    onClick={() => deleteRepayment(r.id)}
                    className="text-danger hover:opacity-70 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
