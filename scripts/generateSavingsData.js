import fs from 'fs'
import path from 'path'

const SOURCE_PATH = path.resolve('extracted/savings/savings-layout.txt')
const OUTPUT_PATH = path.resolve('src/data/memberSavings.json')

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

function normalizeDigits(value) {
  return String(value || '').replace(/\D+/g, '')
}

function parseIdentityRecords(text) {
  const lines = text.replace(/\f/g, '\n').split(/\r?\n/)
  const beforeContinuation = []

  for (const line of lines) {
    if (line.includes('SEPTEMBER2025_amountsaved')) break
    beforeContinuation.push(line)
  }

  const records = []
  let pendingGroup = ''

  for (const raw of beforeContinuation) {
    const line = raw.trimEnd()
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed === 'Group' || trimmed === 'S/N' || trimmed === 'NAME' || trimmed === 'PHONE N0' || trimmed === 'ID NO') continue
    if (trimmed.includes('amountsaved')) continue

    if (KNOWN_GROUPS.includes(trimmed)) {
      pendingGroup = trimmed
      continue
    }

    const prefix = KNOWN_GROUPS.find((group) => trimmed.startsWith(group))
    if (!prefix && !pendingGroup) continue

    const group = prefix || pendingGroup
    const payload = prefix ? trimmed.slice(prefix.length).trim() : trimmed
    if (!payload) continue

    const match = payload.match(/^(.+?)\s{2,}(\d+)?\s{2,}(\d+)?\s{2,}(\d+)\s{2,}(\d+)\s{2,}(\d+)$/)
    if (!match) continue

    const [, snAndName, phoneNumber = '', idNumber = '', june = '0', july = '0', august = '0'] = match
    const nameMatch = snAndName.trim().match(/^((?:HFFP?\d+|HFF\d+|\d+))\s+(.+)$/)
    if (!nameMatch) continue

    const [, snOrUnique, fullName] = nameMatch

    records.push({
      group,
      sourceUniqueNo: normalizeUniqueNo(snOrUnique),
      fullName: fullName.trim().replace(/\s+/g, ' '),
      phoneNumber: normalizeDigits(phoneNumber),
      idNumber: normalizeDigits(idNumber),
      june: Number(june) || 0,
      july: Number(july) || 0,
      august: Number(august) || 0,
    })
  }

  return records
}

function parseTotals(text) {
  const lines = text.replace(/\f/g, '\n').split(/\r?\n/)
  const totals = []

  let inTotals = false
  for (const raw of lines) {
    const trimmed = raw.trim()
    if (trimmed.includes('TOTAL savings per person')) {
      inTotals = true
      continue
    }
    if (!inTotals) continue
    if (!trimmed || trimmed.includes('SHARES') || trimmed.includes('Total savings+Shares')) continue
    if (!/^[0-9 ]+$/.test(trimmed)) continue

    const values = trimmed.split(/\s+/).filter(Boolean).map(Number)
    if (values.length < 2) continue

    const [totalSavings, maybeShares = 0, maybeCombined] = values
    totals.push({
      totalSavings: totalSavings || 0,
      shares: maybeShares || 0,
      totalWithShares: maybeCombined ?? (totalSavings + (maybeShares || 0)),
    })
  }

  return totals
}

function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`Missing source file: ${SOURCE_PATH}`)
  }

  const text = fs.readFileSync(SOURCE_PATH, 'utf8')
  const identities = parseIdentityRecords(text)
  const totals = parseTotals(text)

  const count = Math.min(identities.length, totals.length)
  const combined = identities.slice(0, count).map((identity, index) => ({
    ...identity,
    ...totals[index],
  }))

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(combined, null, 2))

  console.log(`Identity rows: ${identities.length}`)
  console.log(`Savings totals: ${totals.length}`)
  console.log(`Written records: ${combined.length}`)
}

main()
