'use client'

import { useEffect, useState } from 'react'
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plus, Building2, ChevronLeft, ChevronRight, GripVertical, Users } from "lucide-react"
import { getOrganizations, getEmployees } from "@/lib/database"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Organization, Employee } from "@/lib/supabase"

export default function SchedulePage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!userId) {
      router.push("/sign-in")
      return
    }

    fetchScheduleData()
  }, [userId, isLoaded])

  const fetchScheduleData = async () => {
    if (!userId) return

    try {
      const orgs = await getOrganizations(userId)
      setOrganizations(orgs)

      if (orgs.length > 0) {
        const orgId = orgs[0].id
        const emps = await getEmployees(orgId)
        setEmployees(emps)
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() - 7)
      return newDate
    })
  }

  const goToNextWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + 7)
      return newDate
    })
  }

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  // Get the start of the current week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  const weekStart = getWeekStart(currentWeek)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    return date
  })

  // Generate time slots from 6 AM to 10 PM
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6 // Start at 6 AM
    return `${hour.toString().padStart(2, '0')}:00`
  })

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    )
  }

  const hasOrganization = organizations.length > 0
  const activeEmployees = employees.filter(emp => emp.is_active)

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
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
                Overview
              </Link>
              <Link href="/dashboard/employees" className="text-gray-500 hover:text-gray-900">
                Employees
              </Link>
              <Link href="/dashboard/schedule" className="text-gray-900 font-medium">
                Schedule
              </Link>
              <Link href="/dashboard/settings" className="text-gray-500 hover:text-gray-900">
                Settings
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule</h1>
              <p className="text-gray-600">
                Create and manage employee schedules
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={goToCurrentWeek}>
                Today
              </Button>
              <Button variant="outline" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Setup Banner for new users */}
        {!hasOrganization && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Set up your business first</h3>
                    <p className="text-blue-700">Create an organization and add employees before creating schedules</p>
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Week Navigation */}
        {hasOrganization && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Week of {weekStart.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric' 
                    })} - {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {activeEmployees.length} employees available
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Layout with Employee Sidebar */}
        {hasOrganization && activeEmployees.length > 0 ? (
          <div className="flex gap-6">
            {/* Employee Sidebar */}
            <div className="w-80 flex-shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Employees</span>
                  </CardTitle>
                  <CardDescription>
                    Drag employees to schedule shifts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {activeEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedEmployee === employee.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => setSelectedEmployee(employee.id)}
                      >
                        <div className="flex-shrink-0">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{employee.role}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            ${employee.hourly_rate}/hr
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule Grid */}
            <div className="flex-1">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      {/* Grid Header */}
                      <div className="grid grid-cols-8 border-b bg-gray-50">
                        <div className="p-3 border-r font-medium text-gray-700">
                          Time
                        </div>
                        {weekDays.map((day, index) => (
                          <div key={index} className="p-3 border-r text-center">
                            <div className="font-medium text-gray-900">
                              {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Grid Body */}
                      <div className="grid grid-cols-8">
                        {/* Time Column */}
                        <div className="border-r">
                          {timeSlots.map((time, index) => (
                            <div key={index} className="h-16 border-b flex items-center justify-center text-sm text-gray-500 bg-gray-25">
                              {time}
                            </div>
                          ))}
                        </div>

                        {/* Day Columns */}
                        {weekDays.map((day, dayIndex) => (
                          <div key={dayIndex} className="border-r">
                            {timeSlots.map((time, timeIndex) => (
                              <div 
                                key={timeIndex} 
                                className="h-16 border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                              >
                                {/* Empty cell - will be populated with shifts in future subtasks */}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : hasOrganization && activeEmployees.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employees to schedule</h3>
                <p className="text-gray-500 mb-6">
                  Add some employees first to start creating schedules
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  )
} 