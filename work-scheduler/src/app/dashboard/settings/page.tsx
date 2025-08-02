'use client'

import { useEffect, useState } from 'react'
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Settings, Building2, Clock, Users, DollarSign, Globe, Plus } from "lucide-react"
import { getOrganizations } from "@/lib/database"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import SettingsForm from "@/components/settings-form"
import type { Organization } from "@/lib/supabase"

export default function SettingsPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    
    if (!userId) {
      router.push("/sign-in")
      return
    }

    fetchOrganizations()
  }, [userId, isLoaded])

  const fetchOrganizations = async () => {
    if (!userId) return

    try {
      const orgs = await getOrganizations(userId)
      setOrganizations(orgs)
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingsSaved = () => {
    fetchOrganizations() // Refresh data after save
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
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
              <SettingsForm 
                organization={organization} 
                onSuccess={handleSettingsSaved}
              />
            )}
      </main>
    </div>
  )
} 