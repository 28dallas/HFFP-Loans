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

async function createRepayment({ loanId, userId, amount, note, date }) {
  const { data, error } = await supabase
    .from('repayments')
    .insert([{ loan_id: loanId, user_id: userId, amount, note: note || null, date }])
    .select()
    .single()
  if (error) throw error
  await logAction('CREATE Repayment', 'repayments', data.id, `KES ${amount} on ${date} for loan ${loanId}`)
  return data
}

async function deleteRepayment(id) {
  const { error } = await supabase.from('repayments').delete().eq('id', id)
  if (error) throw error
  await logAction('DELETE Repayment', 'repayments', id, `Deleted repayment entry`)
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
