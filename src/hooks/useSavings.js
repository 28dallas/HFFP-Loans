import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logAction } from '../lib/audit'

async function fetchUserSavings(userId) {
  const { data, error } = await supabase
    .from('savings')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

async function createSaving({ userId, amount, note, date }) {
  const { data, error } = await supabase
    .from('savings')
    .insert([{ user_id: userId, amount, note: note || null, date }])
    .select()
    .single()
  if (error) throw error
  await logAction('CREATE Saving', 'savings', data.id, `KES ${amount} on ${date}`)
  return data
}

async function deleteSaving(id) {
  const { error } = await supabase.from('savings').delete().eq('id', id)
  if (error) throw error
  await logAction('DELETE Saving', 'savings', id, `Deleted saving entry`)
}

export function useUserSavings(userId) {
  return useQuery({
    queryKey: ['savings', userId],
    queryFn: () => fetchUserSavings(userId),
    enabled: !!userId,
  })
}

export function useCreateSaving(userId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSaving,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings', userId] })
      qc.invalidateQueries({ queryKey: ['audit_log'] })
    },
  })
}

export function useDeleteSaving(userId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteSaving,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings', userId] })
      qc.invalidateQueries({ queryKey: ['audit_log'] })
    },
  })
}
