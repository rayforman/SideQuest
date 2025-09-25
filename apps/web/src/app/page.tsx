import { supabase } from '@/lib/supabase'
import { QuestCard } from '@/components/quest-card'

export default async function Home() {
  // Fetch quests from Supabase
  const { data: quests, error } = await supabase
    .from('quests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching quests:', error)
  }

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
        
        {/* Status */}
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg inline-block mb-8">
          ✅ Database connected! Showing {quests?.length || 0} quests
        </div>
      </div>

      {/* Quests Grid */}
      {quests && quests.length > 0 ? (
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Available Quests
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
            Error: {error.message}
          </div>
        </div>
      )}
    </main>
  )
}