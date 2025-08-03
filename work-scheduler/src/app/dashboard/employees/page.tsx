'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Users, Plus, Search, Filter, MoreHorizontal } from "lucide-react"
import { getOrganizations, getEmployees, deleteEmployee } from "@/lib/database"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import CreateEmployeeModal from "@/components/create-employee-modal"
import EditEmployeeModal from "@/components/edit-employee-modal"
import type { Organization, Employee } from "@/lib/supabase"

export default function EmployeesPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
    if (!isLoaded) return

    if (!userId) {
      router.push("/sign-in")
      return
    }

    fetchEmployeesData()
  }, [userId, isLoaded])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // Check if the click is on a dropdown menu item
        const isDropdownItem = (target as Element)?.closest('[data-dropdown-item]')
        if (!isDropdownItem) {
          setOpenDropdown(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close dropdown when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const fetchEmployeesData = async () => {
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
      console.error('Error fetching employees:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmployeeCreated = () => {
    fetchEmployeesData()
    // Trigger dashboard refresh
    window.dispatchEvent(new Event('employeeAdded'))
  }

  const handleEmployeeUpdated = () => {
    fetchEmployeesData()
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEditModalOpen(true)
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm('Are you sure you want to remove this employee? This action cannot be undone.')) {
              try {
          await deleteEmployee(employeeId)
          fetchEmployeesData()
          // Trigger dashboard refresh
          window.dispatchEvent(new Event('employeeDeleted'))
          alert('Employee removed successfully')
        } catch (error) {
          console.error('Error deleting employee:', error)
        alert('Failed to remove employee. Please try again.')
      }
    }
    setOpenDropdown(null)
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
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
              <Link href="/dashboard/employees" className="text-gray-900 font-medium">
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
                    <Button onClick={() => setIsEmployeeModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  )}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Employees</h1>
              <p className="text-gray-600">
                Manage your staff members and their information
              </p>
            </div>
                            {hasOrganization && (
                  <Button onClick={() => setIsEmployeeModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                )}
          </div>
        </div>

        {/* Setup Banner for new users */}
        {!hasOrganization && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Set up your business first</h3>
                    <p className="text-blue-700">Create an organization before adding employees</p>
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

        {/* Search and Filters */}
        {hasOrganization && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employees Grid */}
        {hasOrganization && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEmployees.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
                      <p className="text-gray-500 mb-6">Get started by adding your first employee</p>
                      <Button onClick={() => setIsEmployeeModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Employee
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              activeEmployees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">{employee.role}</p>
                        </div>
                      </div>
                      
                      <div className="relative z-20" ref={dropdownRef}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setOpenDropdown(openDropdown === employee.id ? null : employee.id)
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                         {openDropdown === employee.id && (
                           <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] min-w-[120px]">
                             <button
                               onClick={(e) => {
                                 e.preventDefault()
                                 e.stopPropagation()
                                 handleEditEmployee(employee)
                               }}
                               className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100"
                               data-dropdown-item
                             >
                               Edit
                             </button>
                             <button
                               onClick={(e) => {
                                 e.preventDefault()
                                 e.stopPropagation()
                                 handleDeleteEmployee(employee.id)
                               }}
                               className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                               data-dropdown-item
                             >
                               Remove
                             </button>
                           </div>
                         )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {employee.email && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Email:</span>
                          <span className="text-gray-900">{employee.email}</span>
                        </div>
                      )}
                      
                      {employee.phone && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Phone:</span>
                          <span className="text-gray-900">{employee.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hourly Rate:</span>
                        <span className="text-gray-900 font-medium">
                          {employee.hourly_rate > 0 ? `$${employee.hourly_rate}/hr` : 'Not set'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Stats Summary */}
        {hasOrganization && activeEmployees.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Employee Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeEmployees.length}</div>
                  <div className="text-sm text-gray-500">Total Employees</div>
                </div>
                                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${activeEmployees.reduce((sum, emp) => sum + (emp.hourly_rate || 0), 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Total Hourly Rate</div>
                    </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(activeEmployees.map(emp => emp.role)).size}
                  </div>
                  <div className="text-sm text-gray-500">Unique Roles</div>
                </div>
                                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ${Math.round(activeEmployees.reduce((sum, emp) => sum + (emp.hourly_rate || 0), 0) * 40)}
                      </div>
                      <div className="text-sm text-gray-500">Weekly Cost (40hrs)</div>
                    </div>
              </div>
            </CardContent>
          </Card>
                    )}
          </main>

          {/* Employee Creation Modal */}
          {userId && hasOrganization && (
            <CreateEmployeeModal
              isOpen={isEmployeeModalOpen}
              onClose={() => setIsEmployeeModalOpen(false)}
              onSuccess={handleEmployeeCreated}
              organizationId={organizations[0]?.id || ''}
              roles={organizations[0]?.roles || ['Employee', 'Manager']}
            />
          )}

          {/* Employee Edit Modal */}
          {userId && hasOrganization && selectedEmployee && (
            <EditEmployeeModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false)
                setSelectedEmployee(null)
              }}
              onSuccess={handleEmployeeUpdated}
              employee={selectedEmployee}
              roles={organizations[0]?.roles || ['Employee', 'Manager']}
            />
          )}
        </div>
      )
    } 