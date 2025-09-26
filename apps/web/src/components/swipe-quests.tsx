'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
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
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Transform x position to rotation and opacity
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30])

  // Debug function
  const addDebug = (message: string) => {
    console.log('[SwipeQuests]', message)
    setDebugInfo(prev => {
      const lines = (prev + '\n' + message).split('\n')
      return lines.slice(-5).join('\n') // Keep last 5 lines
    })
  }

  // Handle swipe completion
  const handleSwipe = async (direction: 'left' | 'right', quest: Quest) => {
    if (!user) return

    addDebug(`Saving ${direction} swipe for: ${quest.name}`)
    setIsAnimating(true)
    
    try {
      const action = direction === 'right' ? 'liked' : 'disliked'
      
      await supabase
        .from('user_quest_interactions')
        .insert({
          user_id: user.id,
          quest_id: quest.id,
          action: action
        })

      // Move to next card after animation
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setIsAnimating(false)
        x.set(0)
        y.set(0)
        addDebug(`Moved to next quest`)
      }, 300)

    } catch (error) {
      console.error('Error saving interaction:', error)
      addDebug(`Error: ${error}`)
      setIsAnimating(false)
    }
  }

  // Framer Motion drag handler
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100
    const currentQuest = quests[currentIndex]
    
    addDebug(`🔴 Framer Motion Drag ENDED: x=${info.offset.x.toFixed(0)}`)
    
    if (!currentQuest || isAnimating) {
      addDebug('No quest or animating, returning')
      return
    }

    if (info.offset.x > swipeThreshold) {
      addDebug('✅ Framer Motion: Threshold exceeded - swiping RIGHT (like)')
      handleSwipe('right', currentQuest)
    } else if (info.offset.x < -swipeThreshold) {
      addDebug('✅ Framer Motion: Threshold exceeded - swiping LEFT (dislike)')  
      handleSwipe('left', currentQuest)
    } else {
      addDebug('⚠️ Framer Motion: Below threshold - snapping back')
      x.set(0)
      y.set(0)
    }
  }

  // Native mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
    addDebug('🖱️ Mouse DOWN detected')
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartX
    addDebug(`🖱️ Mouse MOVE: deltaX=${deltaX}`)
    x.set(deltaX)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    const deltaX = e.clientX - dragStartX
    addDebug(`🖱️ Mouse UP: deltaX=${deltaX}`)
    
    const currentQuest = quests[currentIndex]
    const swipeThreshold = 100
    
    if (deltaX > swipeThreshold) {
      addDebug('✅ Mouse swipe RIGHT (like)')
      handleSwipe('right', currentQuest)
    } else if (deltaX < -swipeThreshold) {
      addDebug('✅ Mouse swipe LEFT (dislike)')
      handleSwipe('left', currentQuest)
    } else {
      addDebug('⚠️ Mouse swipe below threshold - snapping back')
      x.set(0)
    }
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStartX(e.touches[0].clientX)
    addDebug('📱 Touch START detected')
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const deltaX = e.touches[0].clientX - dragStartX
    addDebug(`📱 Touch MOVE: deltaX=${deltaX}`)
    x.set(deltaX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    const deltaX = e.changedTouches[0].clientX - dragStartX
    addDebug(`📱 Touch END: deltaX=${deltaX}`)
    
    const currentQuest = quests[currentIndex]
    const swipeThreshold = 100
    
    if (deltaX > swipeThreshold) {
      addDebug('✅ Touch swipe RIGHT (like)')
      handleSwipe('right', currentQuest)
    } else if (deltaX < -swipeThreshold) {
      addDebug('✅ Touch swipe LEFT (dislike)')
      handleSwipe('left', currentQuest)
    } else {
      addDebug('⚠️ Touch swipe below threshold - snapping back')
      x.set(0)
    }
  }

  // Manual button actions
  const handleDislike = () => {
    const currentQuest = quests[currentIndex]
    if (currentQuest && !isAnimating) {
      addDebug('Manual dislike button clicked')
      x.set(-300)
      handleSwipe('left', currentQuest)
    }
  }

  const handleLike = () => {
    const currentQuest = quests[currentIndex]
    if (currentQuest && !isAnimating) {
      addDebug('Manual like button clicked')
      x.set(300)
      handleSwipe('right', currentQuest)
    }
  }

  const currentQuest = quests[currentIndex]
  const hasMoreQuests = currentIndex < quests.length

  useEffect(() => {
    addDebug(`Component mounted. Total quests: ${quests.length}`)
  }, [])

  if (!hasMoreQuests) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '600px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '16px' }}>
          You've seen all quests!
        </h2>
        <p style={{ marginBottom: '32px', maxWidth: '400px' }}>
          You've explored all available quests. Check back soon for more adventures!
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '16px',
      backgroundColor: '#0f172a' // dark background
    }}>
      {/* Debug Panel */}
      <div style={{
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '400px',
        width: '100%',
        maxHeight: '100px',
        overflow: 'auto',
        border: '1px solid #666',
        color: '#90EE90'
      }}>
        <strong>Debug Info:</strong>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#ccc' }}>
          {debugInfo}
        </pre>
      </div>

      {/* Progress indicator */}
      <div style={{ width: '100%', maxWidth: '400px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#ccc', marginBottom: '8px' }}>
          <span>Quest {currentIndex + 1} of {quests.length}</span>
        </div>
        <div style={{ width: '100%', backgroundColor: '#374151', borderRadius: '9999px', height: '8px' }}>
          <div style={{
            backgroundColor: '#3b82f6',
            height: '8px',
            borderRadius: '9999px',
            transition: 'all 0.3s',
            width: `${((currentIndex + 1) / quests.length) * 100}%`
          }} />
        </div>
      </div>

      {/* Card Stack */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '500px', marginBottom: '32px' }}>
        {/* Next card (behind) */}
        {quests[currentIndex + 1] && (
          <div style={{
            position: 'absolute',
            inset: '0',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transform: 'scale(0.95)',
            opacity: 0.5,
            border: '2px solid #e5e7eb'
          }}>
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
              Next quest...
            </div>
          </div>
        )}

        {/* Current card - DUAL APPROACH */}
        <motion.div
          style={{
            position: 'absolute',
            inset: '0',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            border: '8px solid white',
            x, y, rotate,
            userSelect: 'none' // Prevent text selection while dragging
          }}
          // Framer Motion drag
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDragStart={(event) => {
            addDebug('🟢 Framer Motion: Drag STARTED!')
          }}
          onDrag={(event, info) => {
            addDebug(`🔵 Framer Motion: Dragging x=${info.offset.x.toFixed(0)}`)
          }}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05 }}
          animate={isAnimating ? { x: x.get() > 0 ? 300 : -300, opacity: 0 } : {}}
          transition={{ duration: 0.3 }}
          // Native event handlers as backup
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp} // Handle mouse leaving card area
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Overlay indicators */}
          <motion.div
            style={{
              position: 'absolute',
              inset: '0',
              backgroundColor: 'rgba(34, 197, 94, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              zIndex: 10,
              opacity: useTransform(x, [0, 100, 300], [0, 0.7, 1])
            }}
          >
            <div style={{
              color: 'white',
              fontSize: '60px',
              fontWeight: 'bold',
              transform: 'rotate(12deg)',
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
            }}>
              LIKE
            </div>
          </motion.div>
          
          <motion.div
            style={{
              position: 'absolute',
              inset: '0',
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              zIndex: 10,
              opacity: useTransform(x, [-300, -100, 0], [1, 0.7, 0])
            }}
          >
            <div style={{
              color: 'white',
              fontSize: '60px',
              fontWeight: 'bold',
              transform: 'rotate(-12deg)',
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
            }}>
              PASS
            </div>
          </motion.div>

          {/* Quest Content */}
          {currentQuest && (
            <>
              {/* Image */}
              <div style={{ height: '256px', width: '100%' }}>
                {currentQuest.image_url ? (
                  <Image
                    src={currentQuest.image_url}
                    alt={currentQuest.name}
                    width={400}
                    height={256}
                    priority
                    style={{ objectFit: 'cover', borderRadius: '16px 16px 0 0', width: '100%', height: '100%' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px 16px 0 0'
                  }}>
                    <span style={{ fontSize: '60px' }}>🗺️</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#111827',
                    lineHeight: '1.2',
                    paddingRight: '8px'
                  }}>
                    {currentQuest.name}
                  </h3>
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>
                    {currentQuest.theme === 'adventure' ? '⚡' :
                     currentQuest.theme === 'relaxation' ? '🧘' :
                     currentQuest.theme === 'culture' ? '🏛️' :
                     currentQuest.theme === 'nightlife' ? '🌙' :
                     currentQuest.theme === 'nature' ? '🌿' : '🗺️'}
                  </span>
                </div>

                {/* Location & Duration */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  <span>📍 {currentQuest.destination_city}, {currentQuest.destination_country}</span>
                  <span>⏰ {currentQuest.duration_days} days</span>
                </div>

                {/* Description */}
                <p style={{ color: '#374151', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                  {currentQuest.description}
                </p>

                {/* Activities */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {currentQuest.activities.slice(0, 3).map((activity, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '12px',
                        borderRadius: '9999px'
                      }}
                    >
                      {activity}
                    </span>
                  ))}
                  {currentQuest.activities.length > 3 && (
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      fontSize: '12px',
                      borderRadius: '9999px'
                    }}>
                      +{currentQuest.activities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        <button
          onClick={handleDislike}
          disabled={isAnimating}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '16px',
            borderRadius: '9999px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            opacity: isAnimating ? 0.5 : 1
          }}
          onMouseOver={(e) => {
            if (!isAnimating) {
              e.currentTarget.style.backgroundColor = '#dc2626'
              e.currentTarget.style.transform = 'scale(1.1)'
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#ef4444'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <span style={{ fontSize: '24px' }}>✕</span>
        </button>

        <button
          onClick={handleLike}
          disabled={isAnimating}
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            padding: '16px',
            borderRadius: '9999px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            opacity: isAnimating ? 0.5 : 1
          }}
          onMouseOver={(e) => {
            if (!isAnimating) {
              e.currentTarget.style.backgroundColor = '#16a34a'
              e.currentTarget.style.transform = 'scale(1.1)'
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#22c55e'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <span style={{ fontSize: '24px' }}>♥</span>
        </button>
      </div>

      {/* Swipe instructions */}
      <div style={{ textAlign: 'center', fontSize: '14px', color: '#d1d5db', marginTop: '16px' }}>
        <p style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '8px 16px',
          borderRadius: '9999px'
        }}>
          👆 Drag the card or use buttons below • Swipe right to like • Swipe left to pass
        </p>
      </div>
    </div>
  )
}