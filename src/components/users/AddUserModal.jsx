import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addUserSchema } from '../../schemas/formSchemas'
import { useCreateUser, useUsers } from '../../hooks/useUsers'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

function getNextUniqueNo(users) {
  const maxUniqueNumber = users.reduce((max, user) => {
    const match = String(user.unique_no || '').match(/^HFFP(\d+)$/i)
    if (!match) return max
    return Math.max(max, Number(match[1]))
  }, 0)

  return `HFFP${String(maxUniqueNumber + 1).padStart(3, '0')}`
}

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

export function AddUserModal({ open, onClose }) {
  const { mutateAsync, isPending } = useCreateUser()
  const { data: users = [] } = useUsers()
  const nextUniqueNo = getNextUniqueNo(users)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addUserSchema) })

  async function onSubmit(data) {
    await mutateAsync(normalizeMemberPayload(data))
    reset()
    onClose()
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add New Member" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Unique No."
            value={nextUniqueNo}
            readOnly
            className="font-mono bg-slate-50"
          />
          <Input
            label="Registration Fee"
            value="Paid"
            readOnly
            className="font-semibold text-success bg-slate-50"
          />
          <Input
            label="Full Name"
            placeholder="e.g. John Mwangi"
            autoComplete="name"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          <Input
            label="ID Number"
            placeholder="National ID number"
            inputMode="numeric"
            error={errors.id_number?.message}
            {...register('id_number')}
          />
          <Input
            label="Phone Number"
            placeholder="07XX XXX XXX"
            inputMode="tel"
            autoComplete="tel"
            error={errors.phone_number?.message}
            {...register('phone_number')}
          />
          <Input
            label="Ground / Location"
            placeholder="e.g. KODUWEN"
            error={errors.ground?.message}
            {...register('ground')}
          />
          <Input
            label="Shares Paid (KES)"
            type="number"
            placeholder="0.00"
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
            placeholder="e.g. Kenyan"
            error={errors.nationality?.message}
            {...register('nationality')}
          />
          <Input
            label="Postal Address"
            placeholder="e.g. P.O. Box 123"
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
