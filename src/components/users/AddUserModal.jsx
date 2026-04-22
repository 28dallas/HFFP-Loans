import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addUserSchema } from '../../schemas/formSchemas'
import { useCreateUser } from '../../hooks/useUsers'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export function AddUserModal({ open, onClose }) {
  const { mutateAsync, isPending } = useCreateUser()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addUserSchema) })

  async function onSubmit(data) {
    await mutateAsync(data)
    reset()
    onClose()
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add New Member">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          placeholder="e.g. John Mwangi"
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label="ID Number"
          placeholder="National ID number"
          error={errors.id_number?.message}
          {...register('id_number')}
        />
        <Input
          label="Phone Number"
          placeholder="+254 7XX XXX XXX"
          error={errors.phone_number?.message}
          {...register('phone_number')}
        />
        <Input
          label="Ground / Location"
          placeholder="e.g. Nairobi West"
          error={errors.ground?.message}
          {...register('ground')}
        />
        <Input
          label="Total Shares (KES)"
          type="number"
          placeholder="0.00"
          step="0.01"
          error={errors.total_shares?.message}
          {...register('total_shares')}
        />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  )
}
