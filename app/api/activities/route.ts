import { NextRequest, NextResponse } from 'next/server'
import { generateRealityEquivalents } from '@/ai/gemini'
import { calculateEquivalents } from '@/features/carbon-engine/calculations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, co2Kg, label } = body

    if (action === 'equivalents') {
      if (typeof co2Kg !== 'number' || co2Kg <= 0) {
        return NextResponse.json({ success: false, error: 'Invalid co2Kg' }, { status: 400 })
      }

      try {
        const equivalents = await generateRealityEquivalents(co2Kg, label || 'activity')
        return NextResponse.json({ success: true, equivalents })
      } catch (aiError) {
        // Fallback to static calculations if AI fails
        const equivalents = calculateEquivalents(co2Kg)
        return NextResponse.json({ success: true, equivalents, fallback: true })
      }
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Activities API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
