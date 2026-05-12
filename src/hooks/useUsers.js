import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const USERS_KEY = ['users']

async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

async function fetchUser(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

async function createUser(payload) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ ...payload, unique_no: '' }])
    .select()
    .single()
  if (error) throw error
  return data
}

async function updateUser({ id, ...payload }) {
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

async function deleteUser(id) {
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) throw error
}

export function useUsers() {
  return useQuery({ queryKey: USERS_KEY, queryFn: fetchUsers })
}

export function useUser(id) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      qc.invalidateQueries({ queryKey: ['dashboard_stats'] })
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      qc.invalidateQueries({ queryKey: ['users', data.id] })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      qc.invalidateQueries({ queryKey: ['dashboard_stats'] })
    },
  })
}

export async function fetchDashboardStats() {
  const { data, error } = await supabase.rpc('get_dashboard_stats')
  if (error) throw error
  return data
}

export function useDashboardStats() {
  return useQuery({ queryKey: ['dashboard_stats'], queryFn: fetchDashboardStats })
}
