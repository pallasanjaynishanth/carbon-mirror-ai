import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/firebase/admin'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const challengeId = searchParams.get('challengeId')

    if (!challengeId) {
      return NextResponse.json({ success: false, error: 'Missing challengeId' }, { status: 400 })
    }

    const challengeDoc = await adminDb.collection('challenges').doc(challengeId).get()
    if (!challengeDoc.exists) {
      return NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 })
    }

    const challenge = challengeDoc.data()
    const participantIds: string[] = challenge?.participantIds || []

    // Build leaderboard by aggregating each participant's activity emissions
    // since challenge start date
    const startDate = challenge?.startDate
    const leaderboard = []

    for (const userId of participantIds) {
      const userDoc = await adminDb.collection('users').doc(userId).get()
      const userData = userDoc.data()

      const activitiesSnap = await adminDb
        .collection('activities')
        .where('userId', '==', userId)
        .where('date', '>=', startDate)
        .get()

      const totalCo2 = activitiesSnap.docs.reduce((sum, doc) => sum + (doc.data().co2Kg || 0), 0)

      leaderboard.push({
        userId,
        displayName: userData?.displayName || 'Anonymous',
        photoURL: userData?.photoURL,
        co2Saved: Math.max(0, (userData?.stats?.weeklyAvgCo2 || 0) - totalCo2),
        co2Total: totalCo2,
        streak: userData?.streak || 0,
      })
    }

    leaderboard.sort((a, b) => a.co2Total - b.co2Total)
    const ranked = leaderboard.map((entry, i) => ({ ...entry, rank: i + 1 }))

    return NextResponse.json({ success: true, leaderboard: ranked })
  } catch (error) {
    console.error('Challenges API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
