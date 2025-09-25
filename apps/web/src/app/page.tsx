'use client'

import { useEffect, useState } from 'react'
import { supabase, Quest, UserProfile } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { QuestCard } from '@/components/quest-card'
import { AuthForm } from '@/components/auth/auth-form'
import { ProfileSetup } from '@/components/profile-setup'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [quests, setQuests] = useState<Quest[]>([])
  const [questsLoading, setQuestsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      checkUserProfile()
      fetchQuests()
    }
  }, [user])

  const checkUserProfile = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error
      }
      
      setUserProfile(data)
    } catch (err: any) {
      console.error('Error checking profile:', err)
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchQuests = async () => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuests(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setQuestsLoading(false)
    }
  }

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile)
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🗺️ Side Quest
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover your next adventure with AI-powered travel quests
          </p>
        </div>

        {/* Auth Form */}
        <AuthForm onAuthSuccess={() => window.location.reload()} />
      </main>
    )
  }

  if (!userProfile) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <ProfileSetup onProfileComplete={handleProfileComplete} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-between max-w-4xl mx-auto px-6 mb-8">
          <div></div> {/* Spacer */}
          <h1 className="text-5xl font-bold text-gray-900">
            🗺️ Side Quest
          </h1>
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
          Welcome back, <span className="font-semibold">{userProfile.username}</span>! Ready for your next adventure?
        </p>
        
        <p className="text-sm text-gray-500 mb-4">
          Interests: {userProfile.travel_interests.join(', ')} • Budget: {userProfile.budget_preference}
        </p>
        
        {/* Status */}
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg inline-block mb-8">
          ✅ Profile Complete! Showing {quests.length} personalized quests
        </div>
      </div>

      {/* Quests Grid */}
      {questsLoading ? (
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading your personalized quests...</div>
        </div>
      ) : quests.length > 0 ? (
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Quests Tailored For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {quests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg inline-block">
            ⚠️ No quests found. Check your database connection.
          </div>
        </div>
      )}

      {/* Debug info */}
      {error && (
        <div className="mt-8 text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg inline-block">
            Error: {error}
          </div>
        </div>
      )}
    </main>
  )
}