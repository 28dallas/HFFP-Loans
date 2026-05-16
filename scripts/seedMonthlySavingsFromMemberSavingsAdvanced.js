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

function normalizeDigits(value) {
  return String(value || '').replace(/\D+/g, '')
}

function buildIndex(users) {
  const byUniqueNo = new Map()
  const byPhone = new Map()
  const byIdNumber = new Map()

  for (const u of users) {
    const un = normalizeUniqueNo(u.unique_no)
    if (un) byUniqueNo.set(un, u)

    const phone = normalizeDigits(u.phone_number)
    if (phone) {
      const existing = byPhone.get(phone)
      if (!existing) byPhone.set(phone, u)
    }

    const idn = normalizeDigits(u.id_number)
    if (idn) {
      const existing = byIdNumber.get(idn)
      if (!existing) byIdNumber.set(idn, u)
    }
  }

  return { byUniqueNo, byPhone, byIdNumber }
}

async function seed({ dryRun = false } = {}) {
  if (!fs.existsSync(INPUT_PATH)) throw new Error(`Missing ${INPUT_PATH}`)
  const memberSavings = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'))

  // Load all users once so we can match multiple ways.
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('id, unique_no, phone_number, id_number')

  if (usersErr) throw usersErr

  const { byUniqueNo, byPhone, byIdNumber } = buildIndex(users || [])

  let inserted = 0
  let skippedNoUser = 0
  let matchedBy = { unique_no: 0, phone: 0, id_number: 0, none: 0 }

  // Optional: avoid duplicates by deleting existing rows for these user/date pairs
  // is schema-dependent, so we keep it simple.

  for (const rec of memberSavings) {
    const unique_no = normalizeUniqueNo(rec.sourceUniqueNo)
    const phone = normalizeDigits(rec.phoneNumber)
    const idNumber = normalizeDigits(rec.idNumber)

    let userRow = byUniqueNo.get(unique_no)

    if (!userRow && phone) userRow = byPhone.get(phone)
    if (!userRow && idNumber) userRow = byIdNumber.get(idNumber)

    if (!userRow) {
      skippedNoUser++
      matchedBy.none++
      continue
    }

    const entries = []

    for (const m of MONTHS) {
      const amountKey = m.key
      const amount = safeNumber(rec[amountKey])
      if (amount <= 0) continue

      // Use mid-month date
      const date = `${m.year}-${m.month}-15`
      entries.push({ user_id: userRow.id, amount, note: `${m.label} contribution`, date })
    }

    if (entries.length === 0) continue

    if (userRow && byUniqueNo.get(unique_no)?.id === userRow.id) matchedBy.unique_no++
    else if (phone && byPhone.get(phone)?.id === userRow.id) matchedBy.phone++
    else if (idNumber && byIdNumber.get(idNumber)?.id === userRow.id) matchedBy.id_number++
    else matchedBy.none++

    if (dryRun) {
      inserted += entries.length
      continue
    }

    const { error: insErr } = await supabase.from('savings').insert(entries)
    if (insErr) throw insErr
    inserted += entries.length
  }

  return { inserted, skippedNoUser, totalRecords: memberSavings.length, matchedBy }
}

const dryRun = process.argv.includes('--dry-run')

seed({ dryRun })
  .then((res) => console.log(JSON.stringify(res, null, 2)))
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })

