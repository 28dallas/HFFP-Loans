import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

async function fetchAuditLog() {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  return data
}

async function createAuditEntry({ action, entity, entityId, details }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('audit_log').insert([{
    admin_email: user?.email ?? 'unknown',
    action,
    entity,
    entity_id: entityId ?? null,
    details: details ?? null,
  }])
  if (error) throw error
}

export function useAuditLog() {
  return useQuery({ queryKey: ['audit_log'], queryFn: fetchAuditLog })
}

export function useLogAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createAuditEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audit_log'] }),
  })
}
