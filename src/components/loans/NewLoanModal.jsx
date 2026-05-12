import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addMonths, format } from 'date-fns'
import { newLoanSchema } from '../../schemas/formSchemas'
import { useCreateLoan } from '../../hooks/useLoans'
import { calculateReducingBalanceLoan, formatCurrency, STANDARD_LOAN_TERMS } from '../../lib/utils'
import { Modal } from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'

export function NewLoanModal({ open, onClose, userId }) {
  const { mutateAsync, isPending } = useCreateLoan()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newLoanSchema),
    defaultValues: {
      interest_rate: '1',
      due_date: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
    },
  })

  const watchedAmount = watch('amount')
  const watchedInterestRate = watch('interest_rate')

  const preview = useMemo(() => {
    const principal = Number(watchedAmount)
    const rate = Number(watchedInterestRate || 1)
    if (!principal || principal <= 0 || Number.isNaN(principal)) return null
    return calculateReducingBalanceLoan(principal, 0, rate)
  }, [watchedAmount, watchedInterestRate])

  async function onSubmit(data) {
    await mutateAsync({
      ...data,
      user_id: userId,
      application_date: format(new Date(), 'yyyy-MM-dd'),
      loan_number: '',
    })
    reset()
    onClose()
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Loan">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Loan Amount (KES)"
          type="number"
          placeholder="e.g. 50000"
          step="0.01"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Input
          label="Interest Rate (%)"
          type="number"
          placeholder="1"
          step="0.01"
          error={errors.interest_rate?.message}
          {...register('interest_rate')}
        />
        <p className="text-xs text-muted">Default interest is 1% using reducing balance.</p>
        <Input
          label="Due Date"
          type="date"
          error={errors.due_date?.message}
          {...register('due_date')}
        />
        <Textarea
          label="Notes (optional)"
          placeholder="Any additional remarks..."
          error={errors.notes?.message}
          {...register('notes')}
        />

        {preview ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted mb-3">
              <span>Loan preview</span>
              <span>{`${watchedInterestRate || 1}% rate · ${STANDARD_LOAN_TERMS.repaymentMonths} months`}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted">Principal</p>
                <p className="font-semibold">{formatCurrency(preview.principal)}</p>
              </div>
              <div>
                <p className="text-muted">Net Disbursement</p>
                <p className="font-semibold text-accent">{formatCurrency(preview.netDisbursement)}</p>
              </div>
              <div>
                <p className="text-muted">Processing Fee (2%)</p>
                <p className="font-semibold text-danger">{formatCurrency(preview.processingFee)}</p>
              </div>
              <div>
                <p className="text-muted">Insurance Fee (1%)</p>
                <p className="font-semibold text-danger">{formatCurrency(preview.insuranceFee)}</p>
              </div>
              <div>
                <p className="text-muted">Ledger Book</p>
                <p className="font-semibold text-danger">{formatCurrency(preview.ledgerFee)}</p>
              </div>
              <div>
                <p className="text-muted">Monthly Installment</p>
                <p className="font-semibold">{formatCurrency(preview.estimatedMonthlyInstallment)}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Create Loan
          </Button>
        </div>
      </form>
    </Modal>
  )
}
