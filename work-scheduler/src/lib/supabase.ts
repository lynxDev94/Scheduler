import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vetcjkcusbsxwuirbqod.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types for TypeScript support
export interface Organization {
  id: string
  name: string
  owner_id: string
  business_hours: {
    [key: string]: string
  }
  timezone: string
  roles: string[]
  default_shift_length: number
  min_staff_per_shift: number
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  organization_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  role: string
  hourly_rate: number
  availability: {
    [key: string]: [string, string]
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  organization_id: string
  employee_id: string
  date: string
  start_time: string
  end_time: string
  role: string
  hourly_rate: number
  type: 'shift' | 'holiday' | 'day-off'
  notes?: string
  created_at: string
  updated_at: string
} 