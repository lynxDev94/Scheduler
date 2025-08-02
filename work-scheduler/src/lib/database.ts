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
export async function createSchedule(data: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) {
  const { data: schedule, error } = await supabase
    .from('schedules')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return schedule
}

export async function getSchedules(organizationId: string, date?: string) {
  let query = supabase
    .from('schedules')
    .select(`
      *,
      employees (
        first_name,
        last_name,
        role
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