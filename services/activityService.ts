import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/firebase/client'
import type { Activity, ActivityCategory } from '@/types'

export interface CreateActivityInput {
  userId: string
  category: ActivityCategory
  label: string
  co2Kg: number
  amount: number
  unit: string
  date?: string
}

/**
 * Creates a new activity entry in Firestore.
 */
export async function createActivity(input: CreateActivityInput): Promise<string> {
  const docRef = await addDoc(collection(db, 'activities'), {
    userId: input.userId,
    category: input.category,
    label: input.label,
    co2Kg: input.co2Kg,
    amount: input.amount,
    unit: input.unit,
    date: input.date || new Date().toISOString().split('T')[0],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Deletes an activity by ID.
 */
export async function deleteActivity(activityId: string): Promise<void> {
  await deleteDoc(doc(db, 'activities', activityId))
}

/**
 * Fetches recent activities for a user.
 */
export async function fetchUserActivities(userId: string, limitCount = 50): Promise<Activity[]> {
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity))
}

/**
 * Fetches activities within a date range.
 */
export async function fetchActivitiesInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Activity[]> {
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity))
}

/**
 * Aggregates total CO2 by category for a list of activities.
 */
export function aggregateByCategory(activities: Activity[]): Record<ActivityCategory, number> {
  return activities.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + a.co2Kg
    return acc
  }, {} as Record<ActivityCategory, number>)
}
