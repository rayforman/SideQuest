'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Quest, UserProfile } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { QuestCard } from '@/components/quest-card'
import { AuthForm } from '@/components/auth/auth-form'
import { ProfileSetup } from '@/components/profile-setup'

export default function Home() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [savedQuests, setSavedQuests] = useState<Quest[]>([])
  const [questsLoading, setQuestsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, liked: 0, saved: 0, remaining: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      checkUserProfile()
      fetchSavedQuests()
      fetchStats()
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

  const fetchSavedQuests = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('saved_quests')
        .select(`
          *,
          quests (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const questsWithData = (data || [])
        .map(item => item.quests)
        .filter(Boolean) as Quest[]
      
      setSavedQuests(questsWithData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setQuestsLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!user) return
    
    try {
      // Get total quests
      const { count: totalQuests, error: totalError } = await supabase
        .from('quests')
        .select('*', { count: 'exact', head: true })
      
      if (totalError) throw totalError

      // Get user interactions
      const { data: interactions, error: interactionsError } = await supabase
        .from('user_quest_interactions')
        .select('action')
        .eq('user_id', user.id)

      if (interactionsError) throw interactionsError

      const liked = interactions?.filter(i => i.action === 'liked').length || 0
      const interactedWith = new Set(interactions?.map(i => i.action) || []).size
      const remaining = (totalQuests || 0) - interactedWith

      // Get saved quests count
      const { count: saved, error: savedError } = await supabase
        .from('saved_quests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (savedError) throw savedError

      setStats({
        total: totalQuests || 0,
        liked,
        saved: saved || 0,
        remaining: Math.max(0, remaining)
      })
    } catch (err: any) {
      console.error('Error fetching stats:', err)
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
        
        <p className="text-sm text-gray-500 mb-8">
          Interests: {userProfile.travel_interests.join(', ')} • Budget: {userProfile.budget_preference}
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Quests</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.liked}</div>
            <div className="text-sm text-gray-600">Liked</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.saved}</div>
            <div className="text-sm text-gray-600">Saved</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.remaining}</div>
            <div className="text-sm text-gray-600">To Explore</div>
          </div>
        </div>
      </div>

      {/* Main Action */}
      <div className="text-center mb-12">
        {stats.remaining > 0 ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl max-w-lg mx-auto">
              <div className="text-3xl mb-4">🔥</div>
              <h2 className="text-2xl font-bold mb-2">Ready to Discover?</h2>
              <p className="text-blue-100 mb-6">
                You have {stats.remaining} new quests waiting for you!
              </p>
              <button
                onClick={() => router.push('/swipe')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Start Swiping 🗺️
              </button>
            </div>
            
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <span>👆 Swipe to like</span>
              <span>👈 Swipe to pass</span>
              <span>⭐ Tap to save</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 p-8 rounded-2xl max-w-lg mx-auto">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">All Caught Up!</h2>
            <p className="text-gray-600 mb-6">
              You've explored all available quests. Check back soon for new adventures!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Refresh for New Quests
            </button>
          </div>
        )}
      </div>

      {/* Saved Quests Section */}
      {questsLoading ? (
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading your saved quests...</div>
        </div>
      ) : savedQuests.length > 0 ? (
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Your Saved Quests ⭐
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {savedQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg inline-block">
            💡 Start swiping to save your favorite quests here!
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="text-center mt-12 space-x-6">
        <button
          onClick={() => router.push('/generate')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          🤖 Try AI Generator
        </button>
        {stats.remaining > 0 && (
          <button
            onClick={() => router.push('/swipe')}
            className="text-green-600 hover:text-green-800 font-medium"
          >
            🗺️ Discover Quests
          </button>
        )}
      </div>

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