'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Quest, UserProfile } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { SwipeQuests } from '@/components/swipe-quests'
import { AuthForm } from '@/components/auth/auth-form'
import { ProfileSetup } from '@/components/profile-setup'

export default function SwipePage() {
  const router = useRouter()
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

      if (error && error.code !== 'PGRST116') {
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
    if (!user) return
    
    try {
      const { data: interactedQuestIds, error: interactionsError } = await supabase
        .from('user_quest_interactions')
        .select('quest_id')
        .eq('user_id', user.id)
        .in('action', ['liked', 'disliked'])

      if (interactionsError) throw interactionsError

      const excludeIds = (interactedQuestIds || []).map(item => item.quest_id)

      let query = supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false })

      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`)
      }

      const { data, error } = await query

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🗺️ Side Quest
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover your next adventure with AI-powered travel quests
          </p>
        </div>
        <AuthForm onAuthSuccess={() => window.location.reload()} />
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <ProfileSetup onProfileComplete={handleProfileComplete} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 bg-black bg-opacity-50 backdrop-blur-md border-b border-gray-700 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              ← Home
            </button>
            
            <h1 className="text-2xl font-bold text-white">
              🗺️ Discover Quests
            </h1>
            
            <button
              onClick={signOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {questsLoading ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <div className="text-xl text-white">Loading your personalized quests...</div>
            </div>
          </div>
        ) : quests.length > 0 ? (
          <SwipeQuests 
            initialQuests={quests}
            userInterests={userProfile.travel_interests}
            userBudget={userProfile.budget_preference}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                You're All Caught Up!
              </h2>
              <p className="text-gray-300 mb-8">
                You've seen all available quests. Check back soon for more adventures!
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Saved Quests
              </button>
            </div>
          </div>
        )}

        {/* Error handling */}
        {error && (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="bg-red-900 bg-opacity-90 border border-red-700 text-red-100 px-6 py-4 rounded-lg max-w-md mx-auto">
              <div className="font-bold mb-2">Oops! Something went wrong</div>
              <div className="text-sm">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User info (debugging) */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-70 p-3 rounded-lg shadow-md text-sm text-gray-300 max-w-xs border border-gray-600">
        <div className="font-medium text-white">{userProfile.username}</div>
        <div>Interests: {userProfile.travel_interests.slice(0, 3).join(', ')}</div>
        <div>Budget: {userProfile.budget_preference}</div>
        <div>Available: {quests.length} quests</div>
      </div>
    </div>
  )
}