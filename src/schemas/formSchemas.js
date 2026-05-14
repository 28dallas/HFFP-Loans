import { z } from 'zod'

export const addUserSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  id_number: z.string().min(5, 'ID number must be at least 5 characters'),
  phone_number: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[0-9+\s\-()]+$/, 'Invalid phone number format'),
  ground: z.string().min(2, 'Ground/Location is required'),
  total_shares: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : 0))
    .pipe(z.number().min(0, 'Shares cannot be negative')),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  postal_address: z.string().optional(),
  gender: z.string().optional(),
  marital_status: z.string().optional(),
})

export const editUserSchema = addUserSchema

export const newLoanSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .transform((v) => parseFloat(v))
    .pipe(z.number().positive('Amount must be greater than 0')),
  interest_rate: z
    .string()
    .min(1, 'Interest rate is required')
    .transform((v) => parseFloat(v))
    .pipe(z.number().min(0).max(100, 'Interest rate cannot exceed 100%')),
  due_date: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
