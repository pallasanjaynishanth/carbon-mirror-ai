import { NextRequest, NextResponse } from 'next/server'
import { generateCarbonStory } from '@/ai/gemini'
import { adminDb } from '@/firebase/admin'
import type { Activity } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, activities } = body as { userId: string; activities: Activity[] }

    if (!userId || !activities?.length) {
      return NextResponse.json({ success: false, error: 'Missing userId or activities' }, { status: 400 })
    }

    const storyData = await generateCarbonStory(activities, userId)

    const story = {
      ...storyData,
      generatedAt: new Date().toISOString(),
    }

    // Persist to Firestore
    const docRef = await adminDb.collection('stories').add(story)

    return NextResponse.json({ success: true, story: { id: docRef.id, ...story } })
  } catch (error) {
    console.error('Stories API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate story' }, { status: 500 })
  }
}
