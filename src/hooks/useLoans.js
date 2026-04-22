import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const LOANS_KEY = ['loans']

async function fetchLoansByUser(userId) {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

async function fetchAllLoans() {
  const { data, error } = await supabase
    .from('loans')
    .select('*, users(full_name, unique_no)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

async function createLoan(payload) {
  const { data, error } = await supabase
    .from('loans')
    .insert([{ ...payload, loan_number: '' }])
    .select()
    .single()
  if (error) throw error
  return data
}

async function updateLoan({ id, ...payload }) {
  const { data, error } = await supabase
    .from('loans')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

async function deleteLoan(id) {
  const { error } = await supabase.from('loans').delete().eq('id', id)
  if (error) throw error
}

export function useLoans() {
  return useQuery({ queryKey: LOANS_KEY, queryFn: fetchAllLoans })
}

export function useUserLoans(userId) {
  return useQuery({
    queryKey: ['loans', 'user', userId],
    queryFn: () => fetchLoansByUser(userId),
    enabled: !!userId,
  })
}

export function useCreateLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createLoan,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: LOANS_KEY })
      qc.invalidateQueries({ queryKey: ['loans', 'user', data.user_id] })
      qc.invalidateQueries({ queryKey: ['dashboard_stats'] })
    },
  })
}

export function useUpdateLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateLoan,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: LOANS_KEY })
      qc.invalidateQueries({ queryKey: ['loans', 'user', data.user_id] })
      qc.invalidateQueries({ queryKey: ['dashboard_stats'] })
    },
  })
}

export function useDeleteLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteLoan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOANS_KEY })
      qc.invalidateQueries({ queryKey: ['dashboard_stats'] })
    },
  })
}
