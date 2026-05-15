import { supabase } from './supabase'

export async function logAction(action, entity, entityId, details) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_log').insert([{
      admin_email: user?.email ?? 'unknown',
      action,
      entity,
      entity_id: entityId ?? null,
      details: details ?? null,
    }])
  } catch {
    // Audit log failures must never break the main action
  }
}
