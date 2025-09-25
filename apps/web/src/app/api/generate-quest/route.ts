import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Validation schema
const QuestGenerationSchema = z.object({
  destination_city: z.string().min(1),
  destination_country: z.string().min(1),
  theme: z.enum(['adventure', 'relaxation', 'culture', 'nightlife', 'nature']),
  budget: z.enum(['budget', 'mid-range', 'luxury']),
  duration_days: z.number().min(1).max(30),
  user_interests: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = QuestGenerationSchema.parse(body)
    
    const { destination_city, destination_country, theme, budget, duration_days, user_interests } = validatedData

    // Create a detailed prompt for OpenAI
    const prompt = `Create a themed travel quest for ${destination_city}, ${destination_country}.

Requirements:
- Theme: ${theme}
- Budget: ${budget}
- Duration: ${duration_days} days
- User interests: ${user_interests?.join(', ') || 'general travel'}

Generate:
1. A creative, catchy quest name (like "Pirates of the Caribbean" or "Tokyo Neon Dreams")
2. An exciting 1-2 sentence description that makes someone want to book immediately
3. 5-7 specific activities that match the theme and location
4. Make it sound like an adventure, not just a regular trip

Format as JSON:
{
  "name": "Quest Name",
  "description": "Exciting description here...",
  "activities": ["activity1", "activity2", "activity3", "activity4", "activity5"]
}

The name should be memorable and themed. The description should be compelling and adventure-focused. Activities should be specific to the location and theme.`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative travel expert who designs exciting, themed travel experiences. You specialize in creating catchy names and compelling descriptions that make people excited about traveling."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8, // [0.0, 1.0] : Higher temperature -> More creative
      max_tokens: 500,
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
      // Fallback if JSON parsing fails
      generatedQuest = {
        name: `${theme.charAt(0).toUpperCase() + theme.slice(1)} in ${destination_city}`,
        description: `Experience the best of ${destination_city} with this ${theme}-focused adventure.`,
        activities: [`explore ${destination_city}`, `local ${theme} activities`, `cultural experiences`]
      }
    }

    // Combine with original data
    const completeQuest = {
      ...generatedQuest,
      destination_city,
      destination_country,
      theme,
      price_range: budget,
      duration_days,
      // We'll add image_url later with another API
      image_url: `https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80`, // Placeholder
    }

    return NextResponse.json({ 
      success: true, 
      quest: completeQuest 
    })

  } catch (error: any) {
    console.error('Quest generation error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate quest' },
      { status: 500 }
    )
  }
}