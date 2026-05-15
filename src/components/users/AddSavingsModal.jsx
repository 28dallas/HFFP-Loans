import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateSaving } from '../../hooks/useSavings'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const schema = z.object({
  amount: z.coerce.number({ invalid_type_error: 'Enter a valid amount' }).positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
})

export function AddSavingsModal({ open, onClose, userId }) {
  const { mutateAsync, isPending } = useCreateSaving(userId)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  async function onSubmit(data) {
    await mutateAsync({ userId, ...data })
    reset()
    onClose()
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add Savings Entry">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
        <Input
          label="Note (optional)"
          placeholder="e.g. September contribution"
          error={errors.note?.message}
          {...register('note')}
        />
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="secondary" type="button" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Add Savings
          </Button>
        </div>
      </form>
    </Modal>
  )
}
