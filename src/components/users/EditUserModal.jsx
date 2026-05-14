import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editUserSchema } from '../../schemas/formSchemas'
import { useUpdateUser } from '../../hooks/useUsers'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

function SelectField({ label, error, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text">{label}</label>
      <select
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white text-text
          transition-all duration-150 outline-none
          ${error
            ? 'border-danger focus:ring-2 focus:ring-danger/30'
            : 'border-slate-200 focus:ring-2 focus:ring-accent/30 focus:border-accent'
          }
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

function normalizeMemberPayload(data) {
  return {
    ...data,
    date_of_birth: data.date_of_birth || null,
    nationality: data.nationality || null,
    postal_address: data.postal_address || null,
    gender: data.gender || null,
    marital_status: data.marital_status || null,
  }
}

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
        date_of_birth: user.date_of_birth ?? '',
        nationality: user.nationality ?? '',
        postal_address: user.postal_address ?? '',
        gender: user.gender ?? '',
        marital_status: user.marital_status ?? '',
      })
    }
  }, [user, reset])

  async function onSubmit(data) {
    await mutateAsync({ id: user.id, ...normalizeMemberPayload(data) })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Member" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            min="0"
            error={errors.total_shares?.message}
            {...register('total_shares')}
          />
          <Input
            label="Date of Birth"
            type="date"
            error={errors.date_of_birth?.message}
            {...register('date_of_birth')}
          />
          <Input
            label="Nationality"
            error={errors.nationality?.message}
            {...register('nationality')}
          />
          <Input
            label="Postal Address"
            error={errors.postal_address?.message}
            {...register('postal_address')}
          />
          <SelectField
            label="Gender"
            error={errors.gender?.message}
            {...register('gender')}
          >
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </SelectField>
          <SelectField
            label="Marital Status"
            error={errors.marital_status?.message}
            {...register('marital_status')}
          >
            <option value="">Select status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </SelectField>
        </div>
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
