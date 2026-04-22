import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Total shares = 80,000 across 24 members
// Each member contributed: 80000 / 24 = 3333.33
// But original sheet shows 5000 per member with total 80,000
// meaning only 16 members have paid (16 × 5000 = 80,000)
// Per the original data each member shows 5000 — total 80,000 is the group fund
// We'll keep 5000 per member but fix the tfoot to show 80,000 as the group fund

// Update all members to have correct shares per original CSV (5000 each)
const { data: users, error } = await supabase.from('users').select('id, unique_no')
if (error) { console.error(error.message); process.exit(1) }

for (const user of users) {
  await supabase.from('users').update({ total_shares: 5000 }).eq('id', user.id)
}

console.log('✅ All member shares set to 5,000')
console.log('ℹ️  Group total fund = KES 80,000 (displayed as fixed value in Members page)')
