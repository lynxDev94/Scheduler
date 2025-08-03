'use client'

import { useEffect, useState } from 'react'
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, Users, FileText, Plus, Settings, BarChart3, Clock, Building2 } from "lucide-react"
import { getOrganizations, getEmployees, getSchedulesForWeek } from "@/lib/database"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import CreateOrganizationModal from "@/components/create-organization-modal"
import CreateEmployeeModal from "@/components/create-employee-modal"
import type { Organization, Employee, Schedule } from "@/lib/supabase"

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false)
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    
    if (!userId) {
      router.push("/sign-in")
      return
    }

    fetchDashboardData()
  }, [userId, isLoaded])

  // Listen for employee changes
  useEffect(() => {
    const handleEmployeeChange = () => {
      fetchDashboardData()
    }

    // Listen for custom events
    window.addEventListener('employeeDeleted', handleEmployeeChange)
    window.addEventListener('employeeAdded', handleEmployeeChange)

    return () => {
      window.removeEventListener('employeeDeleted', handleEmployeeChange)
      window.removeEventListener('employeeAdded', handleEmployeeChange)
    }
  }, [])

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = () => {
      fetchDashboardData()
    }

    window.addEventListener('settingsUpdated', handleSettingsUpdate)
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate)
    }
  }, [])

  const fetchDashboardData = async () => {
    if (!userId) return

    try {
      const orgs = await getOrganizations(userId)
      setOrganizations(orgs)
      
      if (orgs.length > 0) {
        const orgId = orgs[0].id
        const emps = await getEmployees(orgId)
        // Calculate current week dates (same logic as schedule page)
        const currentDate = new Date()
        const currentDay = currentDate.getDay()
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() - daysFromMonday)
        weekStart.setHours(0, 0, 0, 0)
        
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)

        const scheds = await getSchedulesForWeek(orgId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0])
        
        setEmployees(emps)
        setSchedules(scheds)
        
        // Calculate total hours for this week
        const now = new Date()
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
        
        let hours = 0
        scheds.forEach(schedule => {
          if (schedule.date) {
            const scheduleDate = new Date(schedule.date)
            if (scheduleDate >= startOfWeek && scheduleDate <= endOfWeek) {
              const start = new Date(`2000-01-01T${schedule.start_time}`)
              const end = new Date(`2000-01-01T${schedule.end_time}`)
              const shiftHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
              hours += shiftHours
            }
          }
        })
        // Calculate total hours from actual schedules (only for existing employees)
        const calculatedHours = scheds
          .filter(schedule => 
            emps.some(employee => employee.id === schedule.employee_id)
          )
          .reduce((total, schedule) => {
            const start = new Date(`2000-01-01T${schedule.start_time}`)
            const end = new Date(`2000-01-01T${schedule.end_time}`)
            const shiftHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            return total + shiftHours
          }, 0)
        setTotalHours(calculatedHours)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrganizationCreated = () => {
    fetchDashboardData()
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const hasOrganization = organizations.length > 0
  const activeEmployees = employees.filter(emp => emp.is_active)
  // Only count schedules for employees that still exist
  const thisWeekSchedules = schedules.filter(schedule => 
    employees.some(employee => employee.id === schedule.employee_id)
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Task-Master</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-900 font-medium">
                Overview
              </Link>
              <Link href="/dashboard/employees" className="text-gray-500 hover:text-gray-900">
                Employees
              </Link>
              <Link href="/dashboard/schedule" className="text-gray-500 hover:text-gray-900">
                Schedule
              </Link>
              <Link href="/dashboard/settings" className="text-gray-500 hover:text-gray-900">
                Settings
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {hasOrganization && (
                <Button variant="outline" size="sm" onClick={() => setIsEmployeeModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              )}
              <Link href="/dashboard/settings">
                <Button size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{hasOrganization ? `, ${organizations[0]?.name}` : ''}!
          </h1>
          <p className="text-gray-600">
            {hasOrganization 
              ? "Here&apos;s what&apos;s happening with your employee scheduling"
                              : "Let&apos;s get started by setting up your business"
            }
          </p>
        </div>

        {/* Setup Banner for new users */}
        {!hasOrganization && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Set up your business</h3>
                    <p className="text-blue-700">Create your first organization to start managing employees and schedules</p>
                  </div>
                </div>
                <Button onClick={() => setIsOrgModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeEmployees.length === 0 ? 'No employees added yet' : `${activeEmployees.length} active employees`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week&apos;s Shifts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisWeekSchedules}</div>
              <p className="text-xs text-muted-foreground">
                {thisWeekSchedules === 0 ? 'No shifts scheduled' : `${thisWeekSchedules} shifts this week`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalHours)}</div>
              <p className="text-xs text-muted-foreground">
                {totalHours === 0 ? 'No hours scheduled' : `${Math.round(totalHours)} hours this week`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
              <p className="text-xs text-muted-foreground">
                {organizations.length === 0 ? 'No organizations' : 'Active business'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasOrganization ? (
                <>
                  <Button className="w-full" onClick={() => setIsOrgModalOpen(true)}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Create Your First Organization
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Business Settings
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full" onClick={() => setIsEmployeeModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Employee
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                   <Link href="/dashboard/schedule"> Create Weekly Schedule</Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Schedule
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Employees</CardTitle>
              <CardDescription>
                Your most recently added staff members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No employees yet</p>
                  <p className="text-sm">Start by adding your first employee</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeEmployees.slice(0, 3).map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {employee.first_name[0]}{employee.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{employee.role}</p>
                      </div>
                      <Badge variant="secondary">
                        {employee.hourly_rate > 0 ? `$${employee.hourly_rate}/hr` : 'No pricing'}
                      </Badge>
                    </div>
                  ))}
                  {activeEmployees.length > 3 && (
                    <div className="pt-2">
                      <Separator />
                      <p className="text-xs text-gray-500 mt-2">
                        +{activeEmployees.length - 3} more employees
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Business Overview */}
        {hasOrganization && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Business Overview</CardTitle>
              <CardDescription>
                Key information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Business Hours</h4>
                  <div className="space-y-1">
                    {Object.entries(organizations[0].business_hours || {}).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="capitalize">{day}</span>
                        <span className="text-gray-600">{hours as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Roles</h4>
                  <div className="flex flex-wrap gap-1">
                    {(organizations[0].roles || []).map((role: string) => (
                      <Badge key={role} variant="outline">{role}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Settings</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Default Shift Length:</span>
                      <span className="text-gray-600">{organizations[0].default_shift_length || 8} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Staff per Shift:</span>
                      <span className="text-gray-600">{organizations[0].min_staff_per_shift || 1} person</span>
                    </div>
                                            <div className="flex justify-between">
                          <span>Timezone:</span>
                          <span className="text-gray-600">
                            {organizations[0].timezone === 'America/New_York' ? 'Eastern Time' :
                             organizations[0].timezone === 'America/Chicago' ? 'Central Time' :
                             organizations[0].timezone === 'America/Denver' ? 'Mountain Time' :
                             organizations[0].timezone === 'America/Los_Angeles' ? 'Pacific Time' :
                             organizations[0].timezone === 'Europe/London' ? 'London' :
                             organizations[0].timezone === 'Europe/Paris' ? 'Paris' :
                             organizations[0].timezone === 'Asia/Tokyo' ? 'Tokyo' :
                             organizations[0].timezone || 'UTC'}
                          </span>
                        </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Organization Creation Modal */}
      {userId && (
        <CreateOrganizationModal
          isOpen={isOrgModalOpen}
          onClose={() => setIsOrgModalOpen(false)}
          onSuccess={handleOrganizationCreated}
          userId={userId}
        />
      )}

      {/* Employee Creation Modal */}
      {userId && hasOrganization && (
        <CreateEmployeeModal
          isOpen={isEmployeeModalOpen}
          onClose={() => setIsEmployeeModalOpen(false)}
          onSuccess={handleOrganizationCreated}
          organizationId={organizations[0]?.id || ''}
          roles={organizations[0]?.roles || ['Employee', 'Manager']}
        />
      )}
    </div>
  )
} 