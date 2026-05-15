import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion as Motion } from 'framer-motion'
import { Settings2 } from 'lucide-react'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'

const schema = z.object({
  org_name: z.string().min(1, 'Organisation name is required'),
  monthly_interest_rate: z.coerce.number().min(0).max(100),
  processing_fee_rate: z.coerce.number().min(0).max(100),
  insurance_fee_rate: z.coerce.number().min(0).max(100),
  ledger_fee: z.coerce.number().min(0),
  repayment_months: z.coerce.number().int().min(1).max(60),
  max_loan_multiplier: z.coerce.number().min(1),
})

export default function Settings() {
  const { data: settings, isLoading } = useSettings()
  const { mutateAsync, isPending } = useUpdateSettings()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (settings) reset(settings)
  }, [settings, reset])

  async function onSubmit(data) {
    await mutateAsync({ id: settings.id, ...data })
  }

  if (isLoading) return <PageWrapper><PageSpinner /></PageWrapper>

  return (
    <PageWrapper>
      <Motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings2 size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text">Settings</h1>
            <p className="text-sm text-muted">Configure organisation and loan defaults</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl flex flex-col gap-6">
          {/* Organisation */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-text mb-4">Organisation</h2>
            <Input
              label="Organisation Name"
              placeholder="e.g. HFFP"
              error={errors.org_name?.message}
              {...register('org_name')}
            />
          </div>

          {/* Loan Defaults */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-text mb-4">Loan Defaults</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Interest Rate (%)"
                type="number"
                step="0.01"
                error={errors.monthly_interest_rate?.message}
                {...register('monthly_interest_rate')}
              />
              <Input
                label="Repayment Period (months)"
                type="number"
                error={errors.repayment_months?.message}
                {...register('repayment_months')}
              />
              <Input
                label="Max Loan Multiplier (× shares)"
                type="number"
                step="0.1"
                error={errors.max_loan_multiplier?.message}
                {...register('max_loan_multiplier')}
              />
            </div>
          </div>

          {/* Fees */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-text mb-4">Fees</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Processing Fee (%)"
                type="number"
                step="0.01"
                error={errors.processing_fee_rate?.message}
                {...register('processing_fee_rate')}
              />
              <Input
                label="Insurance Fee (%)"
                type="number"
                step="0.01"
                error={errors.insurance_fee_rate?.message}
                {...register('insurance_fee_rate')}
              />
              <Input
                label="Ledger Fee (KES)"
                type="number"
                step="0.01"
                error={errors.ledger_fee?.message}
                {...register('ledger_fee')}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={isPending}>Save Settings</Button>
          </div>
        </form>
      </Motion.div>
    </PageWrapper>
  )
}
