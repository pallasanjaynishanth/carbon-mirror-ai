import { NextRequest, NextResponse } from 'next/server'
import { generateWeeklyReport, analyzeBehaviorPatterns } from '@/ai/gemini'
import { adminDb } from '@/firebase/admin'
import type { Activity } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, activities, previousWeekCo2 } = body as {
      userId: string
      activities: Activity[]
      previousWeekCo2: number
    }

    if (!userId || !activities?.length) {
      return NextResponse.json({ success: false, error: 'Missing userId or activities' }, { status: 400 })
    }

    const [report, behavior] = await Promise.all([
      generateWeeklyReport(userId, activities, previousWeekCo2 || 0),
      analyzeBehaviorPatterns(activities),
    ])

    const reportDoc = {
      userId,
      ...report,
      behavior,
      weekOf: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    const docRef = await adminDb.collection('reports').add(reportDoc)

    return NextResponse.json({ success: true, report: { id: docRef.id, ...reportDoc } })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate report' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 })
    }

    const snap = await adminDb
      .collection('reports')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()

    const reports = snap.docs.map(d => ({ id: d.id, ...d.data() }))

    return NextResponse.json({ success: true, reports })
  } catch (error) {
    console.error('Reports GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 })
  }
}
