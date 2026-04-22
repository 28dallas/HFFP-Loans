import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editUserSchema } from '../../schemas/formSchemas'
import { useUpdateUser } from '../../hooks/useUsers'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export function EditUserModal({ open, onClose, user }) {
  const { mutateAsync, isPending } = useUpdateUser()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(editUserSchema) })

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        id_number: user.id_number,
        phone_number: user.phone_number,
        ground: user.ground,
        total_shares: String(user.total_shares ?? 0),
      })
    }
  }, [user, reset])

  async function onSubmit(data) {
    await mutateAsync({ id: user.id, ...data })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Member">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label="ID Number"
          error={errors.id_number?.message}
          {...register('id_number')}
        />
        <Input
          label="Phone Number"
          error={errors.phone_number?.message}
          {...register('phone_number')}
        />
        <Input
          label="Ground / Location"
          error={errors.ground?.message}
          {...register('ground')}
        />
        <Input
          label="Total Shares (KES)"
          type="number"
          step="0.01"
          error={errors.total_shares?.message}
          {...register('total_shares')}
        />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}
