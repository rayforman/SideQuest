'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Verify and complete Supabase auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          // Redirect to home page after successful login
          router.push('/')
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ✅ Authentication Successful
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You are being logged in...
          </p>
        </div>
      </div>
    </div>
  )
}