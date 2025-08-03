import { supabase, type Organization, type Employee, type Schedule } from './supabase'

// Organization functions
export async function createOrganization(data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) {
  const { data: organization, error } = await supabase
    .from('organizations')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return organization
}

export async function getOrganizations(ownerId: string) {
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', ownerId)

  if (error) throw error
  return organizations
}

export async function updateOrganization(id: string, data: Partial<Organization>) {
  const { data: organization, error } = await supabase
    .from('organizations')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return organization
}

// Employee functions
export async function createEmployee(data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
  const { data: employee, error } = await supabase
    .from('employees')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return employee
}

export async function getEmployees(organizationId: string) {
  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)

  if (error) throw error
  return employees
}

export async function updateEmployee(id: string, data: Partial<Employee>) {
  const { data: employee, error } = await supabase
    .from('employees')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return employee
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase
    .from('employees')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error
}

// Schedule functions
export async function createSchedule(data: {
  organization_id: string
  employee_id: string
  date: string
  start_time: string
  end_time: string
  role: string
  hourly_rate: number
  type: 'shift' | 'holiday' | 'day-off'
  notes?: string
}) {
  try {
    // First try with all fields including type
    const { data: schedule, error } = await supabase
      .from('schedules')
      .insert({
        organization_id: data.organization_id,
        employee_id: data.employee_id,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        role: data.role,
        hourly_rate: data.hourly_rate,
        type: data.type,
        notes: data.notes
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error with type field:', error)
      
      // If that fails, try without the type field (fallback for existing table structure)
      const { data: scheduleFallback, error: fallbackError } = await supabase
        .from('schedules')
        .insert({
          organization_id: data.organization_id,
          employee_id: data.employee_id,
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time,
          role: data.role,
          hourly_rate: data.hourly_rate,
          notes: data.notes
        })
        .select()
        .single()

      if (fallbackError) {
        console.error('Supabase error without type field:', fallbackError)
        throw fallbackError
      }
      
      return scheduleFallback
    }
    
    return schedule
  } catch (error) {
    console.error('Error in createSchedule:', error)
    throw error
  }
}

export async function getSchedulesForWeek(organizationId: string, weekStart: string, weekEnd: string) {
  console.log('getSchedulesForWeek called with:', { organizationId, weekStart, weekEnd })
  
  const { data: schedules, error } = await supabase
    .from('schedules')
    .select(`
      *,
      employees (
        first_name,
        last_name,
        role,
        hourly_rate
      )
    `)
    .eq('organization_id', organizationId)
    .gte('date', weekStart)
    .lte('date', weekEnd)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  console.log('Supabase query result:', { schedules, error })

  if (error) throw error
  return schedules
}

export async function getSchedules(organizationId: string, date?: string) {
  let query = supabase
    .from('schedules')
    .select(`
      *,
      employees (
        first_name,
        last_name,
        role,
        hourly_rate
      )
    `)
    .eq('organization_id', organizationId)

  if (date) {
    query = query.eq('date', date)
  }

  const { data: schedules, error } = await query

  if (error) throw error
  return schedules
}

export async function updateSchedule(id: string, data: Partial<Schedule>) {
  const { data: schedule, error } = await supabase
    .from('schedules')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return schedule
}

export async function deleteSchedule(id: string) {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Helper functions
export async function getOrganizationWithEmployees(organizationId: string) {
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (orgError) throw orgError

  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)

  if (empError) throw empError

  return {
    organization,
    employees
  }
} 