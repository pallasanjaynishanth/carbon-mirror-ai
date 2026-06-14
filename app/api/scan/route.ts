import { NextRequest, NextResponse } from 'next/server'
import { analyzeReceiptWithVision } from '@/ai/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageBase64, mimeType } = body as { imageBase64: string; mimeType: string; userId?: string }

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ success: false, error: 'Missing image data' }, { status: 400 })
    }

    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 })
    }

    // Limit image size (base64 ~33% larger than binary, cap at ~8MB binary)
    if (imageBase64.length > 11_000_000) {
      return NextResponse.json({ success: false, error: 'Image too large' }, { status: 413 })
    }

    const result = await analyzeReceiptWithVision(imageBase64, mimeType)

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Scan API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to analyze receipt' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const maxDuration = 30
