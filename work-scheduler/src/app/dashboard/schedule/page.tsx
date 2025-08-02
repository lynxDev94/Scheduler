import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plus, Building2 } from "lucide-react"
import { getOrganizations } from "@/lib/database"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

export default async function SchedulePage() {
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
              {hasOrganization && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Schedule
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule</h1>
          <p className="text-gray-600">
            Create and manage employee schedules
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

        {/* Schedule Content */}
        {hasOrganization && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Visual Scheduler Coming Soon</h3>
            <p className="text-gray-500 mb-6">
              The drag-and-drop visual scheduler will be implemented in the next phase.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee First
              </Button>
              <Button variant="outline">
                Configure Settings
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 