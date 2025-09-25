require('dotenv').config({ path: './.env.local' })
const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service key for admin operations
const openaiApiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('Missing environment variables. Make sure you have:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  console.error('- OPENAI_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const openai = new OpenAI({ apiKey: openaiApiKey })

// Diverse quest templates for variety
const QUEST_TEMPLATES = [
  // Adventure themes
  { city: 'Reykjavik', country: 'Iceland', theme: 'adventure', budget: 'luxury', duration: 6 },
  { city: 'Queenstown', country: 'New Zealand', theme: 'adventure', budget: 'mid-range', duration: 5 },
  { city: 'Interlaken', country: 'Switzerland', theme: 'adventure', budget: 'luxury', duration: 4 },
  { city: 'Costa Rica', country: 'Costa Rica', theme: 'adventure', budget: 'budget', duration: 8 },
  { city: 'Moab', country: 'USA', theme: 'adventure', budget: 'mid-range', duration: 3 },
  
  // Culture themes
  { city: 'Kyoto', country: 'Japan', theme: 'culture', budget: 'luxury', duration: 7 },
  { city: 'Rome', country: 'Italy', theme: 'culture', budget: 'mid-range', duration: 5 },
  { city: 'Istanbul', country: 'Turkey', theme: 'culture', budget: 'budget', duration: 6 },
  { city: 'Cusco', country: 'Peru', theme: 'culture', budget: 'mid-range', duration: 4 },
  { city: 'Varanasi', country: 'India', theme: 'culture', budget: 'budget', duration: 5 },
  
  // Relaxation themes
  { city: 'Santorini', country: 'Greece', theme: 'relaxation', budget: 'luxury', duration: 6 },
  { city: 'Ubud', country: 'Indonesia', theme: 'relaxation', budget: 'budget', duration: 8 },
  { city: 'Tulum', country: 'Mexico', theme: 'relaxation', budget: 'mid-range', duration: 5 },
  { city: 'Maldives', country: 'Maldives', theme: 'relaxation', budget: 'luxury', duration: 7 },
  { city: 'Sedona', country: 'USA', theme: 'relaxation', budget: 'mid-range', duration: 4 },
  
  // Nightlife themes
  { city: 'Berlin', country: 'Germany', theme: 'nightlife', budget: 'budget', duration: 4 },
  { city: 'Barcelona', country: 'Spain', theme: 'nightlife', budget: 'mid-range', duration: 5 },
  { city: 'Tel Aviv', country: 'Israel', theme: 'nightlife', budget: 'mid-range', duration: 4 },
  { city: 'Bangkok', country: 'Thailand', theme: 'nightlife', budget: 'budget', duration: 6 },
  { city: 'Miami', country: 'USA', theme: 'nightlife', budget: 'luxury', duration: 3 },
  
  // Nature themes
  { city: 'Banff', country: 'Canada', theme: 'nature', budget: 'mid-range', duration: 6 },
  { city: 'Patagonia', country: 'Chile', theme: 'nature', budget: 'luxury', duration: 10 },
  { city: 'Madagascar', country: 'Madagascar', theme: 'nature', budget: 'mid-range', duration: 9 },
  { city: 'Yellowstone', country: 'USA', theme: 'nature', budget: 'budget', duration: 5 },
  { city: 'Tasmania', country: 'Australia', theme: 'nature', budget: 'mid-range', duration: 7 },
]

// Unsplash image categories for different themes
const getImageUrl = (theme, city) => {
  const queries = {
    adventure: 'adventure+travel+mountain',
    culture: 'cultural+heritage+architecture',
    relaxation: 'spa+wellness+beach+sunset',
    nightlife: 'city+night+lights',
    nature: 'landscape+nature+wilderness'
  }
  
  return `https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80&query=${queries[theme]}`
}

async function generateQuestWithAI(template) {
  const { city, country, theme, budget, duration } = template
  
  console.log(`🤖 Generating ${theme} quest for ${city}, ${country}...`)
  
  try {
    const prompt = `Create a themed travel quest for ${city}, ${country}.

Requirements:
- Theme: ${theme}
- Budget: ${budget}
- Duration: ${duration} days

Generate:
1. A creative, catchy quest name (like "Pirates of the Caribbean" or "Samurai Spirit Journey")
2. An exciting 1-2 sentence description that makes someone want to book immediately
3. 5-7 specific activities that match the theme and location

The name should be memorable and adventure-themed. Make it sound like a quest, not just a regular trip.

Format as JSON:
{
  "name": "Creative Quest Name",
  "description": "Compelling adventure description...",
  "activities": ["specific activity 1", "specific activity 2", "specific activity 3", "specific activity 4", "specific activity 5"]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative travel expert who designs exciting, themed travel experiences. Create memorable quest names and compelling descriptions that make people excited about traveling."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9, // High creativity
      max_tokens: 400,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let generatedQuest
    try {
      generatedQuest = JSON.parse(responseText)
    } catch (parseError) {
      console.warn(`Failed to parse JSON for ${city}, using fallback`)
      // Fallback if JSON parsing fails
      generatedQuest = {
        name: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Quest in ${city}`,
        description: `Experience the best of ${city} with this ${theme}-focused adventure that will create memories to last a lifetime.`,
        activities: [`explore ${city}`, `local ${theme} activities`, `cultural experiences`, `photography`, `local cuisine`]
      }
    }

    // Combine with template data
    const completeQuest = {
      name: generatedQuest.name,
      description: generatedQuest.description,
      theme,
      activities: generatedQuest.activities,
      destination_city: city,
      destination_country: country,
      price_range: budget,
      duration_days: duration,
      image_url: getImageUrl(theme, city),
    }

    return completeQuest

  } catch (error) {
    console.error(`Error generating quest for ${city}:`, error.message)
    
    // Fallback quest if API fails
    return {
      name: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Adventure in ${city}`,
      description: `Discover the magic of ${city}, ${country} with this carefully curated ${theme} experience.`,
      theme,
      activities: [`explore ${city}`, `${theme} activities`, `local experiences`, `photography`, `local cuisine`],
      destination_city: city,
      destination_country: country,
      price_range: budget,
      duration_days: duration,
      image_url: getImageUrl(theme, city),
    }
  }
}

async function seedQuests() {
  console.log('🚀 Starting quest generation...')
  console.log(`📊 Generating ${QUEST_TEMPLATES.length} diverse quests`)
  
  const generatedQuests = []
  
  // Generate quests with rate limiting (to avoid API limits)
  for (let i = 0; i < QUEST_TEMPLATES.length; i++) {
    const template = QUEST_TEMPLATES[i]
    
    try {
      const quest = await generateQuestWithAI(template)
      generatedQuests.push(quest)
      
      console.log(`✅ Generated: "${quest.name}"`)
      
      // Rate limit: wait 1 second between API calls
      if (i < QUEST_TEMPLATES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
    } catch (error) {
      console.error(`❌ Failed to generate quest ${i + 1}:`, error.message)
    }
  }
  
  // Insert into database
  if (generatedQuests.length > 0) {
    console.log(`💾 Inserting ${generatedQuests.length} quests into database...`)
    
    const { data, error } = await supabase
      .from('quests')
      .insert(generatedQuests)
      .select()
    
    if (error) {
      console.error('Database error:', error)
      return
    }
    
    console.log(`🎉 Successfully inserted ${data.length} quests!`)
    console.log('🗺️  Quest themes generated:')
    
    // Summary
    const summary = {}
    data.forEach(quest => {
      summary[quest.theme] = (summary[quest.theme] || 0) + 1
    })
    
    Object.entries(summary).forEach(([theme, count]) => {
      console.log(`   ${theme}: ${count} quests`)
    })
    
  } else {
    console.log('❌ No quests were generated successfully')
  }
}

// Run the seeder
seedQuests().catch(console.error)