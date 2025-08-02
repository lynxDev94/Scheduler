'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Clock, Users, DollarSign, Plus, X } from "lucide-react"
import { updateOrganization } from "@/lib/database"
import type { Organization } from "@/lib/supabase"

interface SettingsFormProps {
  organization: Organization
  onSuccess: () => void
}

export default function SettingsForm({ organization, onSuccess }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    name: organization.name,
    timezone: organization.timezone,
    business_hours: organization.business_hours || {},
    roles: organization.roles || [],
    default_shift_length: organization.default_shift_length || 8,
    min_staff_per_shift: organization.min_staff_per_shift || 1
  })
  const [isLoading, setIsLoading] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', rate: 15.00 })

  // Update form data when organization changes
  useEffect(() => {
    setFormData({
      name: organization.name,
      timezone: organization.timezone,
      business_hours: organization.business_hours || {},
      roles: organization.roles || [],
      default_shift_length: organization.default_shift_length || 8,
      min_staff_per_shift: organization.min_staff_per_shift || 1
    })
  }, [organization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateOrganization(organization.id, formData)
      onSuccess()
      // Trigger event for dashboard to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('settingsUpdated'))
      }
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error updating organization:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateBusinessHours = (day: string, isOpen: boolean, startTime: string = '09:00', endTime: string = '17:00') => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: isOpen ? `${startTime}-${endTime}` : 'Closed'
      }
    }))
  }

  const addRole = () => {
    if (newRole.name.trim()) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, newRole.name]
      }))
      setNewRole({ name: '', rate: 15.00 })
    }
  }

  const removeRole = (roleToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role !== roleToRemove)
    }))
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Information */}
      <Card id="business">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Business Information</span>
          </CardTitle>
          <CardDescription>
            Basic information about your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter business name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card id="hours">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Business Hours</span>
          </CardTitle>
          <CardDescription>
            Set your operating hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {days.map((day) => {
              const hours = formData.business_hours[day] || '9AM-5PM'
              const isOpen = hours !== 'Closed'
              const [startTime, endTime] = isOpen ? hours.split('-') : ['09:00', '17:00']
              
              return (
                <div key={day} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isOpen}
                      onChange={(e) => updateBusinessHours(day, e.target.checked, startTime, endTime)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="font-medium capitalize">{day}</span>
                  </div>
                  {isOpen && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => updateBusinessHours(day, true, e.target.value, endTime)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => updateBusinessHours(day, true, startTime, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Roles & Positions */}
      <Card id="roles">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Roles & Positions</span>
          </CardTitle>
          <CardDescription>
            Manage employee roles and their default hourly rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.roles.map((role: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{role}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeRole(role)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
              <input
                type="text"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="New role name"
                className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
              />
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                onClick={addRole}
                disabled={!newRole.name.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Shift Settings</span>
          </CardTitle>
          <CardDescription>
            Configure default shift preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Shift Length (hours)
              </label>
              <input
                type="number"
                value={formData.default_shift_length}
                onChange={(e) => setFormData({ ...formData, default_shift_length: parseInt(e.target.value) })}
                min="1"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Staff per Shift
              </label>
              <input
                type="number"
                value={formData.min_staff_per_shift}
                onChange={(e) => setFormData({ ...formData, min_staff_per_shift: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
} 