import memberSavings from '../data/memberSavings.json'

function normalizeText(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
}

function normalizeDigits(value) {
  return String(value || '').replace(/\D+/g, '')
}

function normalizeUniqueNo(value) {
  if (!value) return ''
  const clean = String(value).toUpperCase().replace(/\s+/g, '')
  const match = clean.match(/^HFFP?(\d{1,4})$/)
  if (match) return `HFFP${match[1].padStart(3, '0')}`
  return clean
}

export function getMemberSavingsRecord(user) {
  if (!user) return null

  const uniqueNo = normalizeUniqueNo(user.unique_no)
  const phoneNumber = normalizeDigits(user.phone_number)
  const idNumber = normalizeDigits(user.id_number)
  const fullName = normalizeText(user.full_name)
  const ground = normalizeText(user.ground)

  return memberSavings.find((entry) => {
    if (uniqueNo && normalizeUniqueNo(entry.sourceUniqueNo) === uniqueNo) return true
    if (phoneNumber && normalizeDigits(entry.phoneNumber) === phoneNumber) return true
    if (idNumber && normalizeDigits(entry.idNumber) === idNumber) return true
    return normalizeText(entry.fullName) === fullName && normalizeText(entry.group) === ground
  }) ?? null
}
