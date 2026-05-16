import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logAction } from '../lib/audit'

async function fetchLoanRepayments(loanId) {
  const { data, error } = await supabase
    .from('repayments')
    .select('*')
    .eq('loan_id', loanId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

async function syncLoanAmountPaid(loanId) {
  const { data: loan, error: loanError } = await supabase
    .from('loans')
    .select('amount, interest_rate, status')
    .eq('id', loanId)
    .single()
  if (loanError) throw loanError

  const { data: repayments, error: repaymentError } = await supabase
    .from('repayments')
    .select('amount')
    .eq('loan_id', loanId)
  if (repaymentError) throw repaymentError

  const amountPaid = repayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const totalRepayable = Number(loan.amount || 0) + (Number(loan.amount || 0) * Number(loan.interest_rate || 0) / 100)
  const updatePayload = { amount_paid: amountPaid }
  if (amountPaid >= totalRepayable) updatePayload.status = 'Paid'

  const { error: updateError } = await supabase
    .from('loans')
    .update(updatePayload)
    .eq('id', loanId)
  if (updateError) throw updateError
}

async function createRepayment({ loanId, userId, amount, note, date }) {
  const { data, error } = await supabase
    .from('repayments')
    .insert([{ loan_id: loanId, user_id: userId, amount, note: note || null, date }])
    .select()
    .single()
  if (error) throw error
  await logAction('CREATE Repayment', 'repayments', data.id, `KES ${amount} on ${date} for loan ${loanId}`)
  await syncLoanAmountPaid(loanId)
  return data
}

async function deleteRepayment({ id, loanId }) {
  const { error } = await supabase.from('repayments').delete().eq('id', id)
  if (error) throw error
  await logAction('DELETE Repayment', 'repayments', id, `Deleted repayment entry`)
  await syncLoanAmountPaid(loanId)
  return id
}

export function useLoanRepayments(loanId) {
  return useQuery({
    queryKey: ['repayments', loanId],
    queryFn: () => fetchLoanRepayments(loanId),
    enabled: !!loanId,
  })
}

export function useCreateRepayment(loanId, userId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createRepayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repayments', loanId] })
      qc.invalidateQueries({ queryKey: ['loans', 'user', userId] })
      qc.invalidateQueries({ queryKey: ['loans'] })
      qc.invalidateQueries({ queryKey: ['dashboard_stats'] })
      qc.invalidateQueries({ queryKey: ['audit_log'] })
    },
  })
}

export function useDeleteRepayment(loanId, userId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteRepayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repayments', loanId] })
      qc.invalidateQueries({ queryKey: ['loans', 'user', userId] })
      qc.invalidateQueries({ queryKey: ['loans'] })
      qc.invalidateQueries({ queryKey: ['dashboard_stats'] })
      qc.invalidateQueries({ queryKey: ['audit_log'] })
    },
  })
}
