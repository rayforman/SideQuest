import Image from 'next/image'
import { Quest } from '@/lib/supabase'

interface QuestCardProps {
  quest: Quest
}

export function QuestCard({ quest }: QuestCardProps) {
  const getPriceEmoji = (price: string) => {
    switch (price) {
      case 'budget': return '💰'
      case 'mid-range': return '💰💰'
      case 'luxury': return '💰💰💰'
      default: return '💰'
    }
  }

  const getThemeEmoji = (theme: string) => {
    switch (theme) {
      case 'adventure': return '⚡'
      case 'relaxation': return '🧘'
      case 'culture': return '🏛️'
      case 'nightlife': return '🌙'
      case 'nature': return '🌿'
      default: return '🗺️'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-48 w-full">{/* Added relative positioning */}
        {quest.image_url ? (
          <Image
            src={quest.image_url}
            alt={quest.name}
            width={400}
            height={200}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
            <span className="text-4xl">🗺️</span>
          </div>
        )}
        
        
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm">
          {getPriceEmoji(quest.price_range)} {quest.price_range}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {quest.name}
          </h3>
          <span className="text-xl ml-2">
            {getThemeEmoji(quest.theme)}
          </span>
        </div>

        {/* Location */}
        <p className="text-gray-600 text-sm mb-3">
          📍 {quest.destination_city}, {quest.destination_country}
        </p>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          {quest.description}
        </p>

        {/* Activities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {quest.activities.slice(0, 4).map((activity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {activity}
              </span>
            ))}
            {quest.activities.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{quest.activities.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center text-gray-600 text-sm">
          <span>⏰ {quest.duration_days} days</span>
        </div>
      </div>
    </div>
  )
}