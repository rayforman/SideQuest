import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our database tables
export type Quest = {
  id: string
  name: string
  description: string
  theme: string
  activities: string[]
  destination_city: string
  destination_country: string
  price_range: 'budget' | 'mid-range' | 'luxury'
  duration_days: number
  image_url: string | null
  created_at: string
}

export type UserProfile = {
  id: string
  username: string
  travel_interests: string[]
  budget_preference: 'budget' | 'mid-range' | 'luxury'
  created_at: string
  updated_at: string
}