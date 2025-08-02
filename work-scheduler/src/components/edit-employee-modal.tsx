'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, X, Clock, DollarSign } from "lucide-react"
import { updateEmployee } from "@/lib/database"
import type { Employee } from "@/lib/supabase"

interface EditEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  employee: Employee
  roles: string[]
}

export default function EditEmployeeModal({ isOpen, onClose, onSuccess, employee, roles }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email || '',
    phone: employee.phone || '',
    role: employee.role,
    hourly_rate: employee.hourly_rate,
    availability: employee.availability || {
      monday: ["9AM", "5PM"],
      tuesday: ["9AM", "5PM"],
      wednesday: ["9AM", "5PM"],
      thursday: ["9AM", "5PM"],
      friday: ["9AM", "5PM"],
      saturday: ["9AM", "5PM"],
      sunday: ["9AM", "5PM"]
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPricing, setShowPricing] = useState(true)

  // Update form data when employee changes
  useEffect(() => {
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role,
      hourly_rate: employee.hourly_rate,
      availability: employee.availability || {
        monday: ["9AM", "5PM"],
        tuesday: ["9AM", "5PM"],
        wednesday: ["9AM", "5PM"],
        thursday: ["9AM", "5PM"],
        friday: ["9AM", "5PM"],
        saturday: ["9AM", "5PM"],
        sunday: ["9AM", "5PM"]
      }
    })
  }, [employee])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateEmployee(employee.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
        hourly_rate: showPricing ? formData.hourly_rate : 0,
        availability: formData.availability
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Failed to update employee. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateAvailability = (day: string, isAvailable: boolean, startTime: string = '9AM', endTime: string = '5PM') => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: isAvailable ? [startTime, endTime] : null
      }
    }))
  }

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  const timeOptions = [
    '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM',
    '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM', '12AM'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle>Edit Employee</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Update employee information and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium">Pricing (Optional)</h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showPricing}
                    onChange={(e) => setShowPricing(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Enable pricing for this employee</span>
                </label>
              </div>
              
              {showPricing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Availability Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-medium">Availability</h3>
              </div>
              <p className="text-sm text-gray-600">
                Set when this employee is available to work. This will be used for scheduling.
              </p>
              
              <div className="space-y-3">
                {days.map(({ key, label }) => {
                  const availability = formData.availability[key]
                  const isAvailable = availability !== null && availability !== undefined
                  const [startTime, endTime] = isAvailable ? availability : ['9AM', '5PM']
                  
                  return (
                    <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          onChange={(e) => updateAvailability(key, e.target.checked, startTime, endTime)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="font-medium">{label}</span>
                      </div>
                      {isAvailable && (
                        <div className="flex items-center space-x-2">
                          <select
                            value={startTime}
                            onChange={(e) => updateAvailability(key, true, e.target.value, endTime)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span className="text-gray-500">to</span>
                          <select
                            value={endTime}
                            onChange={(e) => updateAvailability(key, true, startTime, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 