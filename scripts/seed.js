import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const members = [
  { unique_no: 'HFFP001', full_name: 'JANE KALEL',   phone_number: '748476477', id_number: '9763360',  ground: 'KAPROMTIN',  total_shares: 5000 },
  { unique_no: 'HFFP002', full_name: 'DORCAS CHE',   phone_number: '720787752', id_number: '37122093', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP003', full_name: 'FRIDAH CHE',   phone_number: '711466846', id_number: '26614113', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP004', full_name: 'SELINA C LO',  phone_number: '708196873', id_number: '11712558', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP005', full_name: 'NORAH DAM',    phone_number: '746481803', id_number: '37683720', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP006', full_name: 'IVYNE CHEP',   phone_number: '721527427', id_number: '36720518', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP007', full_name: 'MILKA CHEP',   phone_number: '702353926', id_number: '27692526', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP008', full_name: 'AGNES CHE1',   phone_number: '741664106', id_number: '11714789', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP009', full_name: 'SUSAN CHEF',   phone_number: '792905198', id_number: '26609975', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP010', full_name: 'EVELYNE CH',   phone_number: '768093307', id_number: '37683738', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP011', full_name: 'JACKLINE CI',  phone_number: '795736036', id_number: '37294715', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP012', full_name: 'MILLICENT C',  phone_number: '116194570', id_number: '37683474', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP013', full_name: 'MARGARET',     phone_number: '716139313', id_number: '26079528', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP014', full_name: 'CATEHRINE',    phone_number: '797575847', id_number: '31807707', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP015', full_name: 'JULIA CHE P',  phone_number: '742348199', id_number: '31410016', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP016', full_name: 'SELINA CHE',   phone_number: '707390690', id_number: '11712788', ground: 'KODUWEN',    total_shares: 5000 },
  { unique_no: 'HFFP017', full_name: 'ALICE CHEM',   phone_number: '748180316', id_number: '30779140', ground: 'MARICHOR G', total_shares: 5000 },
  { unique_no: 'HFFP018', full_name: 'MERCY CHE1',   phone_number: '745665709', id_number: '27217057', ground: 'MARICHOR G', total_shares: 5000 },
  { unique_no: 'HFFP019', full_name: 'JOSEPHINE',    phone_number: '116178952', id_number: '20651531', ground: 'MARICHOR G', total_shares: 5000 },
  { unique_no: 'HFFP020', full_name: 'CHE POROSO',   phone_number: '724141623', id_number: '5199288',  ground: 'MARICHOR G', total_shares: 5000 },
  { unique_no: 'HFFP021', full_name: 'CHE POCHEL',   phone_number: '748745243', id_number: '30972007', ground: 'MARICHOR G', total_shares: 5000 },
  { unique_no: 'HFFP022', full_name: 'CHE PORO S',   phone_number: '791434014', id_number: '9406263',  ground: 'MARICHOR G', total_shares: 5000 },
  { unique_no: 'HFFP023', full_name: 'CHEMELSAU',    phone_number: '111752877', id_number: '7696682',  ground: 'SOKOROMWC',  total_shares: 5000 },
  { unique_no: 'HFFP024', full_name: 'SELINA SOLC',  phone_number: '711206360', id_number: '24257367', ground: 'CHE PROPOG', total_shares: 5000 },
]

const { error } = await supabase.from('users').insert(members)
if (error) {
  console.error('❌ Seed error:', error.message)
} else {
  console.log('✅ All 24 members seeded successfully')
}
