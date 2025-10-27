'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase, Quest } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'

interface SwipeQuestsProps {
  initialQuests: Quest[]
  userInterests: string[]
  userBudget: string
}

export function SwipeQuests({ initialQuests, userInterests, userBudget }: SwipeQuestsProps) {
  const { user } = useAuth()
  const [quests] = useState<Quest[]>(initialQuests)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedQuests, setLikedQuests] = useState<Set<string>>(new Set())
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)
  
  // Refs for scroll container and double-tap detection
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastTapRef = useRef<number>(0)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Track which card is currently visible using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = cardRefs.current.findIndex(ref => ref === entry.target)
            if (index !== -1) {
              setCurrentIndex(index)
            }
          }
        })
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.5 // Card is considered "current" when 50% visible
      }
    )

    // Observe all card elements
    cardRefs.current.forEach(card => {
      if (card) observer.observe(card)
    })

    return () => observer.disconnect()
  }, [quests])

  // Handle double-tap to like
  const handleCardTap = useCallback(async (quest: Quest) => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current
    
    if (timeSinceLastTap < 300) { // Double tap detected (within 300ms)
      // Toggle like status
      const isCurrentlyLiked = likedQuests.has(quest.id)
      
      if (!isCurrentlyLiked) {
        // Like the quest
        setLikedQuests(prev => new Set(prev).add(quest.id))
        setShowLikeAnimation(true)
        
        // Save to database if user is logged in
        if (user) {
          try {
            await supabase
              .from('user_quest_interactions')
              .insert({
                user_id: user.id,
                quest_id: quest.id,
                action: 'liked'
              })
          } catch (error) {
            console.error('Error saving like:', error)
          }
        }
        
        // Hide animation after 1 second
        setTimeout(() => setShowLikeAnimation(false), 1000)
      } else {
        // Unlike the quest
        setLikedQuests(prev => {
          const newSet = new Set(prev)
          newSet.delete(quest.id)
          return newSet
        })
        
        // Update database to remove like
        if (user) {
          try {
            await supabase
              .from('user_quest_interactions')
              .delete()
              .match({ user_id: user.id, quest_id: quest.id })
          } catch (error) {
            console.error('Error removing like:', error)
          }
        }
      }
    }
    
    lastTapRef.current = now
  }, [user, likedQuests])

  // Scroll to next card programmatically
  const scrollToCard = (index: number) => {
    const card = cardRefs.current[index]
    if (card && scrollContainerRef.current) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const currentQuest = quests[currentIndex]

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      backgroundColor: '#0f172a',
      overflow: 'hidden'
    }}>
      {/* Header with current position indicator */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        padding: '16px',
        background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9), transparent)',
        pointerEvents: 'none'
      }}>
        {/* Progress dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '8px'
        }}>
          {quests.map((_, index) => (
            <div
              key={index}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: index === currentIndex ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
        
        {/* Liked quests counter */}
        <div style={{
          textAlign: 'center',
          color: '#fff',
          fontSize: '14px',
          opacity: 0.8
        }}>
          ❤️ {likedQuests.size} liked
        </div>
      </div>

      {/* Like animation overlay */}
      {showLikeAnimation && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30,
          pointerEvents: 'none',
          animation: 'heartBeat 1s ease-out'
        }}>
          <div style={{
            fontSize: '120px',
            animation: 'heartFloat 1s ease-out'
          }}>
            ❤️
          </div>
        </div>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        style={{
          height: '100%',
          overflowY: 'scroll',
          overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          // Hide scrollbar
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="hide-scrollbar"
      >
        {quests.map((quest, index) => (
          <div
            key={quest.id}
            ref={el => cardRefs.current[index] = el}
            onClick={() => handleCardTap(quest)}
            style={{
              height: '100vh',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              position: 'relative',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            {/* Card Container */}
            <div style={{
              maxWidth: '400px',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Like indicator */}
              {likedQuests.has(quest.id) && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 10,
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite'
                }}>
                  <span style={{ fontSize: '24px' }}>❤️</span>
                </div>
              )}

              {/* Image */}
              <div style={{ height: '40vh', width: '100%', flexShrink: 0 }}>
                {quest.image_url ? (
                  <Image
                    src={quest.image_url}
                    alt={quest.name}
                    width={400}
                    height={400}
                    priority={index <= 1} // Prioritize first two images
                    style={{ 
                      objectFit: 'cover', 
                      width: '100%', 
                      height: '100%' 
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '80px' }}>🗺️</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ 
                padding: '20px',
                flex: 1,
                overflowY: 'auto'
              }}>
                {/* Header */}
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '4px'
                  }}>
                    {quest.name}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span>📍 {quest.destination_city}, {quest.destination_country}</span>
                    <span>•</span>
                    <span>⏰ {quest.duration_days} days</span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ 
                  color: '#374151', 
                  fontSize: '15px', 
                  marginBottom: '16px', 
                  lineHeight: '1.6' 
                }}>
                  {quest.description}
                </p>

                {/* Activities */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {quest.activities.map((activity, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '13px',
                        borderRadius: '9999px',
                        fontWeight: '500'
                      }}
                    >
                      {activity}
                    </span>
                  ))}
                </div>

                {/* Price indicator */}
                <div style={{
                  marginTop: '16px',
                  padding: '8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  💰 {quest.price_range} • {quest.theme}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* End screen */}
        <div style={{
          height: '100vh',
          scrollSnapAlign: 'start',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎉</div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
            You've seen all quests!
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '32px' }}>
            You liked {likedQuests.size} quest{likedQuests.size !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => scrollToCard(0)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            ↑ Back to top
          </button>
        </div>
      </div>

      {/* Bottom instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '8px 16px',
        borderRadius: '9999px',
        color: 'white',
        fontSize: '14px',
        zIndex: 20,
        pointerEvents: 'none'
      }}>
        👆 Scroll to browse • Double-tap to ❤️ like
      </div>

      {/* CSS for animations and hiding scrollbar */}
      <style jsx>{`
        @keyframes heartBeat {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        
        @keyframes heartFloat {
          0% { transform: translateY(0); }
          100% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}