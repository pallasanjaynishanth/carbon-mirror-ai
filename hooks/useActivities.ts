'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useAuth } from '@/components/layout/AuthProvider'
import type { Activity } from '@/types'

export function useActivities(limitCount = 50) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    if (!user) {
      setActivities([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(limitCount)
      )
      const snap = await getDocs(q)
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }, [user, limitCount])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return { activities, loading, error, refetch: fetchActivities }
}
