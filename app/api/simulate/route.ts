import { NextRequest, NextResponse } from 'next/server'
import { generateSimulation } from '@/ai/gemini'
import type { Activity } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { activities, timeframe } = body as { activities: Activity[]; timeframe: '1m' | '6m' | '12m' }

    if (!activities?.length) {
      return NextResponse.json({ success: false, error: 'No activities provided' }, { status: 400 })
    }

    if (!['1m', '6m', '12m'].includes(timeframe)) {
      return NextResponse.json({ success: false, error: 'Invalid timeframe' }, { status: 400 })
    }

    const simulation = await generateSimulation(activities, timeframe)

    return NextResponse.json({ success: true, simulation })
  } catch (error) {
    console.error('Simulate API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate simulation' }, { status: 500 })
  }
}
