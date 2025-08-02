import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Settings, Building2, Clock, Users, DollarSign, Globe, Plus } from "lucide-react"
import { getOrganizations } from "@/lib/database"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

export default async function SettingsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  // Fetch data from Supabase
  let organizations: any[] = []

  try {
    organizations = await getOrganizations(userId)
  } catch (error) {
    console.error('Error fetching organizations:', error)
  }

  const hasOrganization = organizations.length > 0
  const organization = organizations[0]

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
              <Link href="/dashboard/schedule" className="text-gray-500 hover:text-gray-900">
                Schedule
              </Link>
              <Link href="/dashboard/settings" className="text-gray-900 font-medium">
                Settings
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Save Changes
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Configure your business settings and preferences
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
                    <h3 className="text-lg font-semibold text-blue-900">Set up your business first</h3>
                    <p className="text-blue-700">Create an organization to access settings</p>
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

        {hasOrganization && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    <a href="#business" className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-700">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">Business Information</span>
                    </a>
                    <a href="#hours" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                      <Clock className="h-4 w-4" />
                      <span>Business Hours</span>
                    </a>
                    <a href="#roles" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                      <Users className="h-4 w-4" />
                      <span>Roles & Positions</span>
                    </a>
                    <a href="#pay" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                      <DollarSign className="h-4 w-4" />
                      <span>Pay & Billing</span>
                    </a>
                    <a href="#notifications" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                      <Settings className="h-4 w-4" />
                      <span>Notifications</span>
                    </a>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-6">
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
                        defaultValue={organization?.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter business name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        defaultValue={organization?.timezone || 'UTC'}
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
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            defaultChecked={organization?.business_hours?.[day] ? true : false}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="font-medium capitalize">{day}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            defaultValue="09:00"
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            defaultValue="17:00"
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    ))}
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
                    {(organization?.roles || ['Employee', 'Manager']).map((role: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            defaultValue={role}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">$</span>
                          <input
                            type="number"
                            defaultValue="15.00"
                            step="0.01"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-gray-500">/hr</span>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Role
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Shift Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
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
                        defaultValue={organization?.default_shift_length || 8}
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
                        defaultValue={organization?.min_staff_per_shift || 1}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 