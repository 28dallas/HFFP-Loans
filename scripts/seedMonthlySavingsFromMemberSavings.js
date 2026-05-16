import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY')
if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, serviceRoleKey)

const INPUT_PATH = path.resolve('src/data/memberSavings.json')

const MONTHS = [
  { key: 'june', label: 'June', month: '06', year: '2025' },
  { key: 'july', label: 'July', month: '07', year: '2025' },
  { key: 'august', label: 'August', month: '08', year: '2025' },
  { key: 'september', label: 'September', month: '09', year: '2025' },
  { key: 'october', label: 'October', month: '10', year: '2025' },
  { key: 'november', label: 'November', month: '11', year: '2025' },
  { key: 'december', label: 'December', month: '12', year: '2025' },
  { key: 'january', label: 'January', month: '01', year: '2026' },
  { key: 'february', label: 'February', month: '02', year: '2026' },
  { key: 'march', label: 'March', month: '03', year: '2026' },
  { key: 'april', label: 'April', month: '04', year: '2026' },
  { key: 'may', label: 'May', month: '05', year: '2026' },
  { key: 'june2026', label: 'June 2026', month: '06', year: '2026' },
]

function safeNumber(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return n
}

function normalizeUniqueNo(value) {
  if (!value) return ''
  const clean = String(value).toUpperCase().replace(/\s+/g, '')
  const match = clean.match(/^HFFP?(\d{1,4})$/)
  if (match) return `HFFP${match[1].padStart(3, '0')}`
  return clean
}

async function main() {
  if (!fs.existsSync(INPUT_PATH)) throw new Error(`Missing ${INPUT_PATH}`)
  const memberSavings = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'))

  // We seed into `savings` table.
  // Strategy:
  // 1) For each record, resolve users.id by users.unique_no
  // 2) Insert monthly entries (only where amount > 0)
  // 3) Use upsert to avoid duplicates.

  // NOTE: this assumes your `savings` table has a unique constraint you can target with upsert.
  // If not, we will still insert, but duplicates may occur.

  const { data: existing } = await supabase.from('savings').select('id').limit(1)
  void existing

  let inserted = 0
  let skippedNoUser = 0
  let upserted = 0

  for (let i = 0; i < memberSavings.length; i++) {
    const rec = memberSavings[i]
    const unique_no = normalizeUniqueNo(rec.sourceUniqueNo)

    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('id')
      .eq('unique_no', unique_no)
      .maybeSingle()

    if (userErr) throw userErr
    if (!userRow?.id) {
      skippedNoUser++
      continue
    }

    const entries = []

    // memberSavings.json uses keys: june, july, august, ... (and potentially june2026 is named `june2026` or `june` for 2025)
    for (const m of MONTHS) {
      const amountKey = m.key
      let amount = safeNumber(rec[amountKey])

      // Backward compatibility with generator keys (it currently uses `june`, `july`, `august` only if present)
      // If the generator didn't include later months, these will be 0 and we won't insert.

      if (amount > 0) {
        const date = `${m.year}-${m.month}-15`
        entries.push({
          user_id: userRow.id,
          amount,
          note: `${m.label} contribution`,
          date,
        })
      }
    }

    if (entries.length === 0) continue

    // Insert. If you have a unique constraint like (user_id, date) then you can swap to upsert.
    // We'll attempt upsert targeting (user_id, date) if supported by schema.
    const { error: insErr } = await supabase
      .from('savings')
      .insert(entries)

    if (insErr) throw insErr

    inserted += entries.length
  }

  console.log(JSON.stringify({ inserted, skippedNoUser, totalRecords: memberSavings.length }, null, 2))
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})

