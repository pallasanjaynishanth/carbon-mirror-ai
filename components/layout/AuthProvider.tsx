'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase/client'
import type { UserProfile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(uid: string) {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile)
    }
  }

  async function createProfile(user: User) {
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'Carbon Explorer',
        photoURL: user.photoURL || undefined,
        carbonScore: 500,
        awarenessScore: 0,
        level: 1,
        totalCo2Kg: 0,
        streak: 0,
        joinedAt: new Date().toISOString(),
        preferences: {
          theme: 'dark',
          notifications: true,
          weeklyReport: true,
          timezone: 'Asia/Kolkata',
          country: 'IN',
        },
        stats: {
          weeklyAvgCo2: 0,
          monthlyAvgCo2: 0,
          bestWeekCo2: 0,
          activitiesLogged: 0,
          challengesJoined: 0,
          achievementsUnlocked: 0,
        },
      }
      await setDoc(ref, { ...newProfile, createdAt: serverTimestamp() })
      setProfile(newProfile)
    } else {
      setProfile(snap.data() as UserProfile)
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        await loadProfile(u.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await loadProfile(cred.user.uid)
  }

  async function signUp(email: string, password: string, name: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await createProfile(cred.user)
  }

  async function signInGoogle() {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    await createProfile(cred.user)
  }

  async function logout() {
    await signOut(auth)
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.uid)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signInGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
