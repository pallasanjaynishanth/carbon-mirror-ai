import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/firebase/admin'
import { checkAchievements } from '@/features/carbon-engine/calculations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, totalCo2, activitiesCount, streak, challengesWon } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 })
    }

    const unlockedIds = checkAchievements(
      totalCo2 || 0,
      activitiesCount || 0,
      streak || 0,
      challengesWon || 0
    )

    // Get existing achievements
    const ref = adminDb.collection('achievements').doc(userId)
    const snap = await ref.get()
    const existing = snap.exists ? (snap.data()?.unlocked || []) : []

    const newlyUnlocked = unlockedIds.filter(id => !existing.includes(id))

    if (newlyUnlocked.length > 0) {
      await ref.set(
        {
          unlocked: [...existing, ...newlyUnlocked],
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    }

    return NextResponse.json({ success: true, unlocked: unlockedIds, newlyUnlocked })
  } catch (error) {
    console.error('Achievements API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to check achievements' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 })
    }

    const snap = await adminDb.collection('achievements').doc(userId).get()
    const data = snap.exists ? snap.data() : { unlocked: [] }

    return NextResponse.json({ success: true, achievements: data })
  } catch (error) {
    console.error('Achievements GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch achievements' }, { status: 500 })
  }
}
