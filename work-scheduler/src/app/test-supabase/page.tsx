'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { data, error } = await supabase
          .from('organizations')
          .select('count')
          .limit(1)

        if (error) {
          throw error
        }

        setStatus('success')
        setMessage('✅ Supabase connection successful! Database is accessible.')
      } catch (error: any) {
        setStatus('error')
        setMessage(`❌ Connection failed: ${error.message}`)
        console.error('Supabase connection error:', error)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Supabase Connection Test</h1>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              status === 'loading' ? 'bg-yellow-500' :
              status === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {status === 'loading' ? 'Testing connection...' :
               status === 'success' ? 'Connected' : 'Connection failed'}
            </span>
          </div>

          <div className="bg-gray-100 rounded p-3">
            <p className="text-sm text-gray-700">{message}</p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <h3 className="text-sm font-medium text-red-800 mb-2">Troubleshooting:</h3>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• Check that .env.local exists in project root</li>
                <li>• Verify your Supabase URL and keys are correct</li>
                <li>• Restart your development server</li>
                <li>• Check browser console for detailed errors</li>
              </ul>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <h3 className="text-sm font-medium text-green-800 mb-2">Next Steps:</h3>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Run the SQL schema in Supabase dashboard</li>
                <li>• Start building dashboard features</li>
                <li>• Test creating organizations and employees</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 