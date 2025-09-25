'use client'

import { useState } from 'react'
import { supabase, UserProfile } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface ProfileSetupProps {
  onProfileComplete: (profile: UserProfile) => void
}

const TRAVEL_INTERESTS = [
  { id: 'adventure', label: 'Adventure', emoji: '⚡' },
  { id: 'relaxation', label: 'Relaxation', emoji: '🧘' },
  { id: 'culture', label: 'Culture', emoji: '🏛️' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌙' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'food', label: 'Food & Drink', emoji: '🍜' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'city', label: 'City Exploration', emoji: '🏙️' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'history', label: 'History', emoji: '📜' },
]

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget-Friendly', description: 'Affordable adventures', emoji: '💰' },
  { value: 'mid-range', label: 'Mid-Range', description: 'Balanced comfort and cost', emoji: '💰💰' },
  { value: 'luxury', label: 'Luxury', description: 'Premium experiences', emoji: '💰💰💰' },
]

export function ProfileSetup({ onProfileComplete }: ProfileSetupProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [budgetPreference, setBudgetPreference] = useState<'budget' | 'mid-range' | 'luxury'>('mid-range')
  const [error, setError] = useState('')

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError('')

    try {
      // Validate input
      if (!username.trim()) {
        throw new Error('Username is required')
      }
      if (selectedInterests.length === 0) {
        throw new Error('Please select at least one travel interest')
      }

      // Create user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          username: username.trim(),
          travel_interests: selectedInterests,
          budget_preference: budgetPreference,
        })
        .select()
        .single()

      if (error) throw error

      onProfileComplete(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Side Quest! 🗺️
        </h2>
        <p className="text-gray-600">
          Let's personalize your travel experience by setting up your profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-lg font-semibold text-gray-900 mb-3">
            Choose a username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="AdventureSeeker123"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            required
          />
        </div>

        {/* Travel Interests */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            What type of adventures excite you? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TRAVEL_INTERESTS.map((interest) => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                  selectedInterests.includes(interest.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-1">{interest.emoji}</div>
                <div className="font-medium text-sm">{interest.label}</div>
              </button>
            ))}
          </div>
          {selectedInterests.length === 0 && (
            <p className="text-gray-500 text-sm mt-2">Select at least one interest</p>
          )}
        </div>

        {/* Budget Preference */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            What's your preferred travel budget?
          </label>
          <div className="space-y-3">
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBudgetPreference(option.value as any)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  budgetPreference === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <span>{option.emoji}</span>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    budgetPreference === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {budgetPreference === option.value && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || selectedInterests.length === 0}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating Profile...' : 'Start My Adventure! 🚀'}
        </button>
      </form>
    </div>
  )
}