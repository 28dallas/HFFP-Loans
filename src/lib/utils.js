import { format, isPast, differenceInDays, parseISO } from 'date-fns'

export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return 'KES 0.00'
  return `KES ${Number(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(dateString) {
  if (!dateString) return '—'
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'd MMM yyyy')
  } catch {
    return '—'
  }
}

export function isOverdue(dueDate, status) {
  if (status !== 'Active') return false
  try {
    const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
    return isPast(date)
  } catch {
    return false
  }
}

export function getDaysOverdue(dueDate) {
  try {
    const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
    const days = differenceInDays(new Date(), date)
    return days > 0 ? days : 0
  } catch {
    return 0
  }
}

export function getOutstandingBalance(loan) {
  if (!loan) return 0
  const { amount = 0, interest_rate = 0, amount_paid = 0 } = loan
  return Number(amount) + Number(amount) * (Number(interest_rate) / 100) - Number(amount_paid)
}

export function generateLoanNumber(count) {
  const year = new Date().getFullYear()
  return `LN-${year}-${String(count).padStart(3, '0')}`
}

export function getInitials(fullName) {
  if (!fullName) return '?'
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function maskIdNumber(idNumber) {
  if (!idNumber) return '••••••••'
  const str = String(idNumber)
  const visible = str.slice(-4)
  const masked = '•'.repeat(Math.max(str.length - 4, 4))
  return `${masked}${visible}`
}

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-pink-600',
]

export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  const index = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}
