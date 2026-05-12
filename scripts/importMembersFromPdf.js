import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const PDF_TEXT_PATH = path.resolve('extracted/members-layout.txt')
const DRY_RUN = process.argv.includes('--dry-run')

const KNOWN_GROUPS = [
  'KORURON YWALATEKE',
  'KOTULPOGHAB',
  'TAKAR CHELAKATET',
  'SONGOTIOBULES',
  'MARICHOR GROUP',
  'KUKUGHOI UMOJA',
  'SERETOW STAB',
  'CHELAKATET',
  'KAPCHEMOGEN',
  'KOKWOLOUTUT',
  'CHEPROPOGH',
  'KOLION SILK',
  'MURSAMOGH',
  'KAPROMTIN',
  'CHEPOTULA',
  'SOKOROMWO',
  'WORMSIWA',
  'LULUONOI',
  'CHEPUNGWA',
  'AKOKONG',
  'SELENGA',
  'CHERIKO',
  'TIROKWO',
  'CANNAN',
  'KODUWEN',
  'RENA AB',
  'SAMOR',
  'PTERO',
  'LOTUR',
  'ARON',
  'KAMOS',
  'SOPON',
  'SIYAI C',
]

function normalizeUniqueNo(value) {
  if (!value) return ''
  const clean = String(value).toUpperCase().replace(/\s+/g, '')
  const match = clean.match(/^HFFP?(\d{1,4})$/)
  if (match) return `HFFP${match[1].padStart(3, '0')}`
  return ''
}

function normalizeName(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
}

function normalizeDigits(value) {
  return String(value || '').replace(/\D+/g, '')
}

function isIdentifierToken(value) {
  return /^[0-9]+$/.test(value) && value.length >= 5
}

function shouldSkipLine(line) {
  const trimmed = line.trim()
  if (!trimmed) return true
  if (trimmed === 'Group' || trimmed === 'S/N' || trimmed === 'NAME' || trimmed === 'PHONE N0' || trimmed === 'ID NO') return true
  if (trimmed.includes('amountsaved')) return true
  if (trimmed === 'SHARES' || trimmed === 'Total' || trimmed === 'average' || trimmed === 'contributed') return true
  if (trimmed.includes('Total number of months contributed')) return true
  if (trimmed.includes('amount contributed during contributions')) return true
  return false
}

function findGroupPrefix(value) {
  return KNOWN_GROUPS.find((group) => value.startsWith(group)) ?? ''
}

function parseShares(remaining) {
  if (remaining.length < 4) return 0
  const raw = Number(remaining[remaining.length - 4])
  return Number.isFinite(raw) ? raw : 0
}

function buildRecord(group, snAndName, remaining) {
  const match = snAndName.match(/^([A-Z0-9]+)\s+(.+)$/i)
  if (!match) return null

  const sourceUnique = normalizeUniqueNo(match[1])
  const fullName = match[2].trim().replace(/\s+/g, ' ')
  let cursor = 0
  let phoneNumber = ''
  let idNumber = ''

  if (isIdentifierToken(remaining[cursor])) {
    if (isIdentifierToken(remaining[cursor + 1])) {
      phoneNumber = normalizeDigits(remaining[cursor])
      idNumber = normalizeDigits(remaining[cursor + 1])
      cursor += 2
    } else {
      idNumber = normalizeDigits(remaining[cursor])
      cursor += 1
    }
  }

  return {
    source_unique_no: sourceUnique,
    full_name: fullName,
    phone_number: phoneNumber,
    id_number: idNumber,
    ground: group,
    total_shares: parseShares(remaining.slice(cursor)),
  }
}

function parseMembers(text) {
  const lines = text.split(/\r?\n/)
  const members = []
  let pendingSnAndName = ''

  for (const line of lines) {
    if (line.includes('\f')) {
      pendingSnAndName = ''
    }

    const sanitized = line.replace(/\f/g, '').trimEnd()
    if (shouldSkipLine(sanitized)) continue

    const parts = sanitized.split(/\s{2,}/).filter(Boolean)
    if (parts.length === 1) {
      const token = parts[0].trim()
      if (/^(HFFP?\d+|HFF\d+|\d+)\s+/.test(token)) {
        pendingSnAndName = token
      }
      continue
    }

    let group = ''
    let snAndName = ''
    let remaining = []

    if (KNOWN_GROUPS.includes(parts[0]) && parts[1] && /^(HFFP?\d+|HFF\d+|\d+)\s+/.test(parts[1])) {
      group = parts[0]
      snAndName = parts[1]
      remaining = parts.slice(2)
    } else if (KNOWN_GROUPS.includes(parts[0]) && pendingSnAndName) {
      group = parts[0]
      snAndName = pendingSnAndName
      remaining = parts.slice(1)
      pendingSnAndName = ''
    } else {
      const prefix = findGroupPrefix(parts[0])
      if (!prefix) continue
      group = prefix
      snAndName = parts[0].slice(prefix.length).trim()
      remaining = parts.slice(1)
    }

    const record = buildRecord(group, snAndName, remaining)
    if (!record) continue
    if (!record.full_name) continue
    members.push(record)
  }

  const deduped = new Map()
  for (const member of members) {
    const key = [
      member.source_unique_no || 'nouid',
      normalizeDigits(member.phone_number) || 'nophone',
      normalizeDigits(member.id_number) || 'noid',
      normalizeName(member.full_name),
      member.ground,
    ].join('|')

    const existing = deduped.get(key)
    if (!existing || member.total_shares > existing.total_shares) {
      deduped.set(key, member)
    }
  }

  return Array.from(deduped.values())
}

function buildUserIndexes(users) {
  return {
    byUnique: new Map(users.filter((u) => u.unique_no).map((u) => [normalizeUniqueNo(u.unique_no), u])),
    byPhone: new Map(users.filter((u) => u.phone_number).map((u) => [normalizeDigits(u.phone_number), u])),
    byId: new Map(users.filter((u) => u.id_number).map((u) => [normalizeDigits(u.id_number), u])),
    byNameGround: new Map(
      users.map((u) => [`${normalizeName(u.full_name)}|${u.ground}`, u])
    ),
  }
}

function findExistingUser(indexes, member) {
  if (member.source_unique_no && indexes.byUnique.has(member.source_unique_no)) {
    return indexes.byUnique.get(member.source_unique_no)
  }

  const phone = normalizeDigits(member.phone_number)
  if (phone && indexes.byPhone.has(phone)) {
    return indexes.byPhone.get(phone)
  }

  const id = normalizeDigits(member.id_number)
  if (id && indexes.byId.has(id)) {
    return indexes.byId.get(id)
  }

  const nameGroundKey = `${normalizeName(member.full_name)}|${member.ground}`
  if (indexes.byNameGround.has(nameGroundKey)) {
    return indexes.byNameGround.get(nameGroundKey)
  }

  return null
}

function mergePayload(existing, member) {
  return {
    full_name: member.full_name || existing.full_name,
    phone_number: member.phone_number || existing.phone_number,
    id_number: member.id_number || existing.id_number,
    ground: member.ground || existing.ground,
    total_shares: member.total_shares || existing.total_shares || 0,
  }
}

async function main() {
  if (!fs.existsSync(PDF_TEXT_PATH)) {
    throw new Error(`Source text file not found: ${PDF_TEXT_PATH}`)
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const text = fs.readFileSync(PDF_TEXT_PATH, 'utf8')
  const parsedMembers = parseMembers(text)

  const { data: existingUsers, error: fetchError } = await supabase
    .from('users')
    .select('id, unique_no, full_name, phone_number, id_number, ground, total_shares')

  if (fetchError) throw fetchError

  const indexes = buildUserIndexes(existingUsers)
  const updates = []
  const inserts = []

  for (const member of parsedMembers) {
    const existing = findExistingUser(indexes, member)
    if (existing) {
      updates.push({ id: existing.id, ...mergePayload(existing, member) })
      continue
    }

    inserts.push({
      unique_no: '',
      full_name: member.full_name,
      phone_number: member.phone_number,
      id_number: member.id_number || '00000',
      ground: member.ground,
      total_shares: member.total_shares || 0,
    })
  }

  console.log(`Parsed members: ${parsedMembers.length}`)
  console.log(`Existing users: ${existingUsers.length}`)
  console.log(`Will update: ${updates.length}`)
  console.log(`Will insert: ${inserts.length}`)

  if (DRY_RUN) {
    console.log('\nSample inserts:')
    console.log(inserts.slice(0, 10))
    return
  }

  for (const payload of updates) {
    const { id, ...data } = payload
    const { error } = await supabase.from('users').update(data).eq('id', id)
    if (error) {
      console.error('Update failed for', payload, error.message)
    }
  }

  if (inserts.length) {
    const { error } = await supabase.from('users').insert(inserts)
    if (error) throw error
  }

  console.log('Import complete.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
