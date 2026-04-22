import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { newLoanSchema } from '../../schemas/formSchemas'
import { useCreateLoan } from '../../hooks/useLoans'
import { Modal } from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'

export function NewLoanModal({ open, onClose, userId }) {
  const { mutateAsync, isPending } = useCreateLoan()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newLoanSchema),
    defaultValues: { interest_rate: '10' },
  })

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
          placeholder="10"
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
        <Textarea
          label="Notes (optional)"
          placeholder="Any additional remarks..."
          error={errors.notes?.message}
          {...register('notes')}
        />
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
