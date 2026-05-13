import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const loanData = [
  { unique_no: 'HFFP001', amount: 15000 },
  { unique_no: 'HFFP002', amount: 24000 },
  { unique_no: 'HFFP003', amount: 27000 },
  { unique_no: 'HFFP004', amount: 24000 },
  { unique_no: 'HFFP005', amount: 13500 },
  { unique_no: 'HFFP006', amount: 15000 },
  { unique_no: 'HFFP007', amount: 12000 },
  { unique_no: 'HFFP008', amount: 15000 },
  { unique_no: 'HFFP009', amount: 18000 },
  { unique_no: 'HFFP010', amount: 15000 },
  { unique_no: 'HFFP011', amount: 10500 },
  { unique_no: 'HFFP012', amount: 13500 },
  { unique_no: 'HFFP013', amount: 10500 },
  { unique_no: 'HFFP014', amount: 15000 },
  { unique_no: 'HFFP015', amount: 13500 },
  { unique_no: 'HFFP016', amount: 15000 },
  { unique_no: 'HFFP017', amount: 18000 },
  { unique_no: 'HFFP018', amount: 6000  },
  { unique_no: 'HFFP019', amount: 18000 },
  { unique_no: 'HFFP020', amount: 15000 },
  { unique_no: 'HFFP021', amount: 15000 },
  { unique_no: 'HFFP022', amount: 10500 },
  { unique_no: 'HFFP023', amount: 30000 },
  { unique_no: 'HFFP024', amount: 30000 },
  { unique_no: 'HFFP025', amount: 15000 },
  { unique_no: 'HFFP026', amount: 12000 },
  { unique_no: 'HFFP027', amount: 12000 },
  { unique_no: 'HFFP028', amount: 9000 },
  { unique_no: 'HFFP029', amount: 19500 },
  { unique_no: 'HFFP030', amount: 15000 },
  { unique_no: 'HFFP031', amount: 19500 },
  { unique_no: 'HFFP032', amount: 15000 },
  { unique_no: 'HFFP033', amount: 15000 },
  { unique_no: 'HFFP034', amount: 18000 },
  { unique_no: 'HFFP035', amount: 15000 },
  { unique_no: 'HFFP036', amount: 18000 },
  { unique_no: 'HFFP037', amount: 18000 },
  { unique_no: 'HFFP038', amount: 16500 },
  { unique_no: 'HFFP039', amount: 16500 },
  { unique_no: 'HFFP040', amount: 16500 },
  { unique_no: 'HFFP041', amount: 15000 },
  { unique_no: 'HFFP042', amount: 15000 },
  { unique_no: 'HFFP043', amount: 15000 },
  { unique_no: 'HFFP044', amount: 15000 },
  { unique_no: 'HFFP045', amount: 16500 },
  { unique_no: 'HFFP046', amount: 15000 },
  { unique_no: 'HFFP047', amount: 30000 },
  { unique_no: 'HFFP048', amount: 16500 },
  { unique_no: 'HFFP050', amount: 18000 },
  { unique_no: 'HFFP051', amount: 18000 },
  { unique_no: 'HFFP052', amount: 18000 },
  { unique_no: 'HFFP053', amount: 20000 },
  { unique_no: 'HFFP054', amount: 30000 },
  { unique_no: 'HFFP055', amount: 15000 },
  { unique_no: 'HFFP056', amount: 30000 },
  { unique_no: 'HFFP057', amount: 30000 },
  { unique_no: 'HFFP058', amount: 30000 },
  { unique_no: 'HFFP059', amount: 30000 },
  { unique_no: 'HFFP060', amount: 15000 },
  { unique_no: 'HFFP061', amount: 15000 },
  { unique_no: 'HFFP062', amount: 10500 },
  { unique_no: 'HFFP063', amount: 12000 },
  { unique_no: 'HFFP064', amount: 13500 },
  { unique_no: 'HFFP065', amount: 15000 },
  { unique_no: 'HFFP066', amount: 15000 },
  { unique_no: 'HFFP067', amount: 40000 },
  { unique_no: 'HFFP068', amount: 15000 },
  { unique_no: 'HFFP069', amount: 24000 },
  { unique_no: 'HFFP070', amount: 12000 },
  { unique_no: 'HFFP071', amount: 15000 },
  { unique_no: 'HFFP072', amount: 9000 },
  { unique_no: 'HFFP073', amount: 12000 },
  { unique_no: 'HFFP074', amount: 10500 },
  { unique_no: 'HFFP075', amount: 10500 },
  { unique_no: 'HFFP076', amount: 6000 },
  { unique_no: 'HFFP077', amount: 10500 },
  { unique_no: 'HFFP078', amount: 10500 },
  { unique_no: 'HFFP079', amount: 18000 },
]

// Fetch all users to get their IDs
const { data: users, error: usersError } = await supabase
  .from('users')
  .select('id, unique_no')

if (usersError) {
  console.error('❌ Failed to fetch users:', usersError.message)
  process.exit(1)
}

const userMap = Object.fromEntries(users.map((u) => [u.unique_no, u.id]))

const loans = loanData.map((l, i) => ({
  user_id: userMap[l.unique_no],
  loan_number: `LN-2026-${String(i + 1).padStart(3, '0')}`,
  amount: l.amount,
  interest_rate: 1.00,
  application_date: '2026-03-01',
  due_date: '2026-08-31',
  status: 'Active',
  amount_paid: 0,
  notes: 'March 2026 first batch disbursement',
}))

const missing = loans.filter((l) => !l.user_id)
if (missing.length) {
  console.error('❌ Some users not found in DB. Run member seed first.')
  process.exit(1)
}

const { error } = await supabase.from('loans').insert(loans)
if (error) {
  console.error('❌ Loan seed error:', error.message)
} else {
  console.log('✅ All 78 loan records seeded successfully (24 first batch + 54 second batch)')
}
