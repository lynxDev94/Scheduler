'use client'

import { useEffect, useState } from 'react'
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plus, Building2, ChevronLeft, ChevronRight, GripVertical, Users, Clock, X } from "lucide-react"
import { getOrganizations, getEmployees } from "@/lib/database"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Organization, Employee } from "@/lib/supabase"

interface Shift {
  id: string
  employeeId: string
  employeeName: string
  date: string
  startTime: string
  endTime: string
  role: string
  hourlyRate: number
  type: 'shift' | 'holiday' | 'day-off'
}

export default function SchedulePage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isCreateShiftOpen, setIsCreateShiftOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ day: Date; employeeId: string } | null>(null)
  const [newShift, setNewShift] = useState({
    employeeId: '',
    startTime: '',
    endTime: '',
    role: '',
    type: 'shift' as 'shift' | 'holiday' | 'day-off'
  })

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

  const handleCellClick = (day: Date, employeeId: string) => {
    setSelectedCell({ day, employeeId })
    setNewShift({
      employeeId: employeeId,
      startTime: '09:00',
      endTime: '17:00',
      role: '',
      type: 'shift'
    })
    setIsCreateShiftOpen(true)
  }

  const handleCreateShift = () => {
    if (!selectedCell) return

    // For holidays and day-offs, we don't need time validation
    if (newShift.type === 'shift' && (!newShift.startTime || !newShift.endTime)) return

    const employee = employees.find(emp => emp.id === selectedCell.employeeId)
    if (!employee) return

    const shift: Shift = {
      id: `shift-${Date.now()}`,
      employeeId: selectedCell.employeeId,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      date: selectedCell.day.toISOString().split('T')[0],
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      role: newShift.role || employee.role,
      hourlyRate: employee.hourly_rate,
      type: newShift.type
    }

    setShifts(prev => [...prev, shift])
    setIsCreateShiftOpen(false)
    setSelectedCell(null)
    setNewShift({ employeeId: '', startTime: '', endTime: '', role: '', type: 'shift' })
  }

  const handleDeleteShift = (shiftId: string) => {
    setShifts(prev => prev.filter(shift => shift.id !== shiftId))
  }

  // Get shifts for a specific employee and day
  const getShiftsForEmployeeAndDay = (employeeId: string, day: Date) => {
    const dateStr = day.toISOString().split('T')[0]
    return shifts.filter(shift => 
      shift.employeeId === employeeId && 
      shift.date === dateStr
    )
  }

  // Calculate total hours worked for an employee on a specific day
  const getTotalHoursForEmployeeAndDay = (employeeId: string, day: Date) => {
    const dayShifts = getShiftsForEmployeeAndDay(employeeId, day)
    let totalHours = 0

    dayShifts.forEach(shift => {
      if (shift.type === 'shift' && shift.startTime && shift.endTime) {
        const start = new Date(`2000-01-01T${shift.startTime}`)
        const end = new Date(`2000-01-01T${shift.endTime}`)
        const diffMs = end.getTime() - start.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        totalHours += diffHours
      }
    })

    return totalHours
  }

  // Calculate total hours worked for all employees on a specific day
  const getTotalHoursForDay = (day: Date) => {
    let totalHours = 0
    activeEmployees.forEach(employee => {
      totalHours += getTotalHoursForEmployeeAndDay(employee.id, day)
    })
    return totalHours
  }

  // Calculate total hours worked for an employee in the week
  const getTotalHoursForEmployee = (employeeId: string) => {
    let totalHours = 0
    weekDays.forEach(day => {
      totalHours += getTotalHoursForEmployeeAndDay(employeeId, day)
    })
    return totalHours
  }

  // Calculate total hours worked by all employees in the week
  const getTotalHoursForAllEmployees = () => {
    let totalHours = 0
    activeEmployees.forEach(employee => {
      totalHours += getTotalHoursForEmployee(employee.id)
    })
    return totalHours
  }

  // Calculate shift width based on duration
  const calculateShiftWidth = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    // Keep shifts contained within the cell - max 90% of cell width
    return Math.max(80, Math.min(140, diffHours * 25)) // Min 80px, max 140px
  }

  // Generate a consistent color for each employee
  const getEmployeeColor = (employeeId: string) => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-900',
      'bg-green-100 border-green-300 text-green-900',
      'bg-purple-100 border-purple-300 text-purple-900',
      'bg-orange-100 border-orange-300 text-orange-900',
      'bg-pink-100 border-pink-300 text-pink-900',
      'bg-indigo-100 border-indigo-300 text-indigo-900',
      'bg-teal-100 border-teal-300 text-teal-900',
      'bg-red-100 border-red-300 text-red-900',
      'bg-yellow-100 border-yellow-300 text-yellow-900',
      'bg-cyan-100 border-cyan-300 text-cyan-900'
    ]
    const index = employees.findIndex(emp => emp.id === employeeId)
    return colors[index % colors.length]
  }

  // Get color for different shift types
  const getShiftTypeColor = (type: 'shift' | 'holiday' | 'day-off') => {
    switch (type) {
      case 'holiday':
        return 'bg-red-100 border-red-300 text-red-900'
      case 'day-off':
        return 'bg-gray-100 border-gray-300 text-gray-900'
      default:
        return 'bg-blue-100 border-blue-300 text-blue-900'
    }
  }

  // Get employee initials
  const getEmployeeInitials = (employeeName: string) => {
    return employeeName.split(' ').map(name => name[0]).join('').toUpperCase()
  }

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
                    {activeEmployees.length} employees available • {shifts.length} shifts scheduled
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employee-Centric Schedule Layout */}
        {hasOrganization && activeEmployees.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="w-[1090px]">
                  {/* Schedule Header */}
                  <div className="flex border-b bg-gray-50">
                    <div className="p-4 border-r font-medium text-gray-700 w-[250px] flex-shrink-0">
                      Employee
                    </div>
                    {weekDays.map((day, index) => (
                      <div key={index} className="p-4 border-r text-center w-[120px] flex-shrink-0">
                        <div className="font-medium text-gray-900">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Employee Rows */}
                  <div className="divide-y">
                    {activeEmployees.map((employee) => (
                      <div key={employee.id} className="flex">
                        {/* Employee Info Column */}
                        <div className="p-4 border-r bg-gray-25 flex items-center space-x-3 w-[250px] flex-shrink-0">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="text-sm">
                              {employee.first_name[0]}{employee.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {employee.first_name} {employee.last_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{employee.role}</p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              ${employee.hourly_rate}/hr
                            </Badge>
                          </div>
                        </div>

                        {/* Day Columns */}
                        {weekDays.map((day, dayIndex) => {
                          const dayShifts = getShiftsForEmployeeAndDay(employee.id, day)
                          
                          return (
                            <div 
                              key={dayIndex} 
                              className="p-2 border-r min-h-[80px] hover:bg-blue-50 cursor-pointer transition-colors relative overflow-hidden w-[120px] flex-shrink-0"
                              onClick={() => handleCellClick(day, employee.id)}
                            >
                              {/* Shifts for this employee on this day */}
                              <div className="space-y-1">
                                {dayShifts.map((shift, shiftIndex) => (
                                  <div
                                    key={shift.id}
                                    className={`${shift.type === 'shift' ? getEmployeeColor(shift.employeeId) : getShiftTypeColor(shift.type)} border rounded px-2 py-1 text-xs group flex items-center space-x-2 relative z-10`}
                                    style={{
                                      width: shift.type === 'shift' ? `${calculateShiftWidth(shift.startTime, shift.endTime)}px` : '100%',
                                      minWidth: '80px',
                                      maxWidth: '100%'
                                    }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium">
                                        {shift.type === 'shift' ? `${shift.startTime} - ${shift.endTime}` : shift.type === 'holiday' ? 'Holiday' : 'Day Off'}
                                      </div>
                                      <div className="text-xs opacity-75 truncate">
                                        {shift.type === 'shift' ? shift.role : ''}
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteShift(shift.id)
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded p-0.5 flex-shrink-0"
                                    >
                                      <X className="h-2 w-2" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Empty state indicator */}
                              {dayShifts.length === 0 && (
                                <div className="text-gray-400 text-xs text-center pt-4">
                                  Click to add shift
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Summary Row */}
                  <div className="flex border-t bg-gray-50">
                    <div className="p-4 border-r font-medium text-gray-700 w-[250px] flex-shrink-0">
                      <div className="text-sm font-semibold">Weekly Totals</div>
                      <div className="text-lg font-bold text-blue-600 mt-1">
                        Total: {getTotalHoursForAllEmployees().toFixed(1)}h
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {activeEmployees.map(emp => {
                          const totalHours = getTotalHoursForEmployee(emp.id)
                          return (
                            <div key={emp.id} className="truncate">
                              {emp.first_name}: {totalHours.toFixed(1)}h
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const totalHours = getTotalHoursForDay(day)
                      return (
                        <div key={dayIndex} className="p-4 border-r text-center w-[120px] flex-shrink-0">
                          <div className="font-semibold text-gray-900">
                            {totalHours.toFixed(1)}h
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {activeEmployees.filter(emp => getShiftsForEmployeeAndDay(emp.id, day).length > 0).length} employees
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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

      {/* Create Shift Dialog */}
      <Dialog open={isCreateShiftOpen} onOpenChange={setIsCreateShiftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Schedule Entry</DialogTitle>
            <DialogDescription>
              Create a new entry for {selectedCell && selectedCell.day.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={newShift.type} onValueChange={(value: 'shift' | 'holiday' | 'day-off') => setNewShift(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shift">Regular Shift</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="day-off">Day Off</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newShift.type === 'shift' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Select value={newShift.startTime} onValueChange={(value) => setNewShift(prev => ({ ...prev, startTime: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Select value={newShift.endTime} onValueChange={(value) => setNewShift(prev => ({ ...prev, endTime: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newShift.role} onValueChange={(value) => setNewShift(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations[0]?.roles?.map((role: string) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateShiftOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateShift}>
                Create {newShift.type === 'shift' ? 'Shift' : newShift.type === 'holiday' ? 'Holiday' : 'Day Off'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 