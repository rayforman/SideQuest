'use client'

import { useState } from 'react'
import { QuestCard } from '@/components/quest-card'

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedQuest, setGeneratedQuest] = useState<any>(null)
  const [error, setError] = useState('')

  // Form state
  const [city, setCity] = useState('Paris')
  const [country, setCountry] = useState('France')
  const [theme, setTheme] = useState('culture')
  const [budget, setBudget] = useState('mid-range')
  const [duration, setDuration] = useState(5)

  const generateQuest = async () => {
    setIsLoading(true)
    setError('')
    setGeneratedQuest(null)

    try {
      const response = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination_city: city,
          destination_country: country,
          theme,
          budget,
          duration_days: duration,
          user_interests: ['culture', 'food'] // Mock user interests
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate quest')
      }

      setGeneratedQuest({
        ...data.quest,
        id: 'generated-' + Date.now(), // Mock ID for display
        created_at: new Date().toISOString(),
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          🤖 AI Quest Generator
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Test the OpenAI integration by generating custom travel quests
        </p>

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paris, Tokyo, Bali..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="France, Japan, Indonesia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="adventure">Adventure ⚡</option>
                <option value="relaxation">Relaxation 🧘</option>
                <option value="culture">Culture 🏛️</option>
                <option value="nightlife">Nightlife 🌙</option>
                <option value="nature">Nature 🌿</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="budget">Budget 💰</option>
                <option value="mid-range">Mid-Range 💰💰</option>
                <option value="luxury">Luxury 💰💰💰</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (days): {duration}
              </label>
              <input
                type="range"
                min="1"
                max="14"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <button
            onClick={generateQuest}
            disabled={isLoading}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '🤖 Generating Quest...' : '✨ Generate AI Quest'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-8">
            Error: {error}
          </div>
        )}

        {/* Generated Quest */}
        {generatedQuest && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🎉 Generated Quest
            </h2>
            <div className="max-w-sm mx-auto">
              <QuestCard quest={generatedQuest} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}