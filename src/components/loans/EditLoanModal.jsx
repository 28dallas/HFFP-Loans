import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUpdateLoan } from '../../hooks/useLoans'
import { Modal } from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'

const schema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  interest_rate: z.coerce.number().min(0).max(100),
  due_date: z.string().min(1, 'Due date is required'),
  status: z.enum(['Pending', 'Active', 'Paid', 'Overdue']),
  amount_paid: z.coerce.number().min(0),
  notes: z.string().optional(),
})

export function EditLoanModal({ open, onClose, loan }) {
  const { mutateAsync, isPending } = useUpdateLoan()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (loan) {
      reset({
        amount: loan.amount,
        interest_rate: loan.interest_rate,
        due_date: loan.due_date,
        status: loan.status,
        amount_paid: loan.amount_paid ?? 0,
        notes: loan.notes ?? '',
      })
    }
  }, [loan, reset])

  async function onSubmit(data) {
    await mutateAsync({ id: loan.id, ...data })
    onClose()
  }

  if (!loan) return null

  return (
    <Modal open={open} onClose={onClose} title={`Edit Loan — ${loan.loan_number}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Loan Amount (KES)"
            type="number"
            step="0.01"
            error={errors.amount?.message}
            {...register('amount')}
          />
          <Input
            label="Interest Rate (%)"
            type="number"
            step="0.01"
            error={errors.interest_rate?.message}
            {...register('interest_rate')}
          />
          <Input
            label="Due Date"
            type="date"
            error={errors.due_date?.message}
            {...register('due_date')}
          />
          <Input
            label="Amount Paid (KES)"
            type="number"
            step="0.01"
            error={errors.amount_paid?.message}
            {...register('amount_paid')}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text">Status</label>
          <select
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            {...register('status')}
          >
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        <Textarea
          label="Notes (optional)"
          placeholder="Any remarks..."
          error={errors.notes?.message}
          {...register('notes')}
        />
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" loading={isPending}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  )
}
