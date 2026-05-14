import { format, isPast, differenceInDays, parseISO } from 'date-fns'
import { getBatchLoanDetail } from '../data/batchLoanDetails'

export const STANDARD_LOAN_TERMS = {
  monthlyInterestRate: 0.01,
  repaymentMonths: 6,
  processingFeeRate: 0.02,
  insuranceFeeRate: 0.01,
  ledgerFee: 100,
}

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

function getLoanUniqueNo(loan, fallbackUniqueNo) {
  return fallbackUniqueNo || loan?.unique_no || loan?.users?.unique_no
}

export function getOutstandingBalance(loan, fallbackUniqueNo) {
  if (!loan) return 0
  if (loan.status === 'Paid') return 0
  const calculation = getLoanCalculation(loan, fallbackUniqueNo)
  return calculation.estimatedOutstanding
}

export function getLoanCalculation(loan, fallbackUniqueNo) {
  const amount = Number(loan?.amount) || 0
  const amountPaid = Number(loan?.amount_paid) || 0
  const interestRate = Number(loan?.interest_rate) || 0
  const baseCalculation = calculateReducingBalanceLoan(amount, amountPaid, interestRate)
  const batchDetail = getBatchLoanDetail(getLoanUniqueNo(loan, fallbackUniqueNo), amount)

  if (!batchDetail) return baseCalculation

  return {
    ...baseCalculation,
    source: 'batch-sheet',
    batch: batchDetail.batch,
    totalInterest: batchDetail.interestCharges,
    totalRepayable: batchDetail.totalRepayable,
    netDisbursement: batchDetail.netDisbursement,
    estimatedMonthlyInstallment: batchDetail.monthlyPayment,
    estimatedOutstanding: Math.max(batchDetail.totalRepayable - amountPaid, 0),
  }
}

export function calculateReducingBalanceLoan(amount, amountPaid = 0, interestRatePercent = 1, terms = STANDARD_LOAN_TERMS) {
  const principal = Number(amount) || 0
  const paid = Number(amountPaid) || 0
  const monthlyRate = Number(interestRatePercent) / 100
  const repaymentMonths = terms.repaymentMonths

  const processingFee = principal * terms.processingFeeRate
  const insuranceFee = principal * terms.insuranceFeeRate
  const ledgerFee = terms.ledgerFee
  const totalDeductions = processingFee + insuranceFee + ledgerFee
  const netDisbursement = principal - totalDeductions
  const monthlyPrincipal = repaymentMonths > 0 ? principal / repaymentMonths : 0

  let remainingBalance = principal
  let totalInterest = 0

  for (let month = 0; month < repaymentMonths; month += 1) {
    const monthInterest = remainingBalance * monthlyRate
    totalInterest += monthInterest
    remainingBalance = Math.max(remainingBalance - monthlyPrincipal, 0)
  }

  const totalRepayable = principal + totalInterest
  const estimatedMonthlyInstallment = repaymentMonths > 0
    ? totalRepayable / repaymentMonths
    : totalRepayable
  const estimatedOutstanding = Math.max(totalRepayable - paid, 0)

  return {
    principal,
    monthlyRate,
    repaymentMonths,
    processingFee,
    insuranceFee,
    ledgerFee,
    totalDeductions,
    netDisbursement,
    monthlyPrincipal,
    totalInterest,
    totalRepayable,
    estimatedMonthlyInstallment,
    estimatedOutstanding,
  }
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
