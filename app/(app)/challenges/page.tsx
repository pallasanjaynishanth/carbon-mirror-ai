'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useAuth } from '@/components/layout/AuthProvider'
import { Users, Trophy, Plus, Calendar, Target, ArrowRight, Loader2 } from 'lucide-react'
import type { Challenge } from '@/types'
import toast from 'react-hot-toast'
import { format, differenceInDays } from 'date-fns'

const CHALLENGE_TEMPLATES = [
  {
    title: 'No Car Week 🚗',
    description: 'Avoid personal vehicle use for 7 days. Use public transport, cycle, or walk.',
    type: 'no_car' as const,
    targetReductionPct: 30,
    duration: 7,
    icon: '🚗',
  },
  {
    title: 'Green Commute Month 🚌',
    description: 'Use only public transport or cycling for all commutes for 30 days.',
    type: 'green_commute' as const,
    targetReductionPct: 25,
    duration: 30,
    icon: '🚌',
  },
  {
    title: 'Plant-Based Week 🌱',
    description: 'Eat only plant-based meals for 7 days. No meat, minimal dairy.',
    type: 'sustainable_food' as const,
    targetReductionPct: 20,
    duration: 7,
    icon: '🌱',
  },
  {
    title: 'Energy Saver Month ⚡',
    description: 'Reduce electricity consumption by 20% compared to last month.',
    type: 'energy_save' as const,
    targetReductionPct: 20,
    duration: 30,
    icon: '⚡',
  },
]

export default function ChallengesPage() {
  const { user, profile } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof CHALLENGE_TEMPLATES[0] | null>(null)

  const fetchChallenges = useCallback(async () => {
    const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'))
    // Note: In production, filter to public/team challenges
    const snap = await getDocs(q)
    setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge)))
    setLoading(false)
  }, [])

  useEffect(() => { fetchChallenges() }, [fetchChallenges])

  async function joinChallenge(challengeId: string) {
    if (!user) return
    setJoining(challengeId)
    try {
      await updateDoc(doc(db, 'challenges', challengeId), {
        participantIds: arrayUnion(user.uid),
      })
      toast.success('Joined challenge! Good luck! 🌱')
      fetchChallenges()
    } catch {
      toast.error('Failed to join. Try again.')
    } finally {
      setJoining(null)
    }
  }

  async function createChallenge() {
    if (!user || !selectedTemplate) return
    setCreating(true)
    try {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + selectedTemplate.duration)

      await addDoc(collection(db, 'challenges'), {
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        type: selectedTemplate.type,
        targetReductionPct: selectedTemplate.targetReductionPct,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        participantIds: [user.uid],
        leaderboard: [],
        status: 'active',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      })
      toast.success('Challenge created! Share it with friends.')
      setShowCreate(false)
      setSelectedTemplate(null)
      fetchChallenges()
    } catch {
      toast.error('Failed to create challenge.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Community Challenges</h1>
          <p className="text-muted-foreground text-sm">Compete, collaborate, and hold each other accountable.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-earth-500 hover:bg-earth-400 text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          New Challenge
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: 'Active Challenges', value: challenges.filter(c => c.status === 'active').length },
          { icon: Trophy, label: 'Total Participants', value: challenges.reduce((s, c) => s + c.participantIds.length, 0) },
          { icon: Target, label: 'Challenges Joined', value: challenges.filter(c => c.participantIds?.includes(user?.uid || '')).length },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <s.icon className="w-4 h-4 text-earth-400 mb-2" />
            <div className="text-2xl font-bold mb-0.5">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Challenges grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 h-40 shimmer" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🌍</div>
          <div className="text-lg font-semibold mb-2">No challenges yet</div>
          <div className="text-sm text-muted-foreground mb-4">Create the first community challenge!</div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 rounded-lg bg-earth-500 hover:bg-earth-400 text-white text-sm font-medium transition-all"
          >
            Create a challenge
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {challenges.map((challenge, i) => {
            const isJoined = challenge.participantIds?.includes(user?.uid || '')
            const daysLeft = differenceInDays(new Date(challenge.endDate), new Date())
            const isActive = challenge.status === 'active' && daysLeft >= 0

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-card rounded-xl border transition-all card-hover ${
                  isJoined ? 'border-earth-500/30' : 'border-border'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-earth-500/10 text-earth-400' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {isActive ? '● Active' : 'Ended'}
                        </span>
                        {isJoined && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">
                            Joined
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold">{challenge.title}</h3>
                    </div>
                    <div className="text-2xl shrink-0">
                      {CHALLENGE_TEMPLATES.find(t => t.type === challenge.type)?.icon || '🎯'}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{challenge.description}</p>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <div className="text-sm font-semibold">{challenge.participantIds?.length || 0}</div>
                      <div className="text-[10px] text-muted-foreground">Members</div>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <div className="text-sm font-semibold">{challenge.targetReductionPct}%</div>
                      <div className="text-[10px] text-muted-foreground">Target</div>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <div className="text-sm font-semibold">{Math.max(0, daysLeft)}d</div>
                      <div className="text-[10px] text-muted-foreground">Left</div>
                    </div>
                  </div>

                  {!isJoined && isActive && (
                    <button
                      onClick={() => joinChallenge(challenge.id)}
                      disabled={joining === challenge.id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-earth-500 hover:bg-earth-400 text-white text-sm font-medium transition-all disabled:opacity-60"
                    >
                      {joining === challenge.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>Join Challenge <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  )}

                  {isJoined && (
                    <div className="text-center text-xs text-earth-400 py-1">
                      ✓ You&apos;re participating
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create Challenge Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={e => e.target === e.currentTarget && setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border border-border w-full max-w-lg p-6"
            >
              <h3 className="font-semibold text-lg mb-1">Create a Challenge</h3>
              <p className="text-sm text-muted-foreground mb-5">Choose a template to get started.</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {CHALLENGE_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTemplate(t)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedTemplate?.type === t.type
                        ? 'border-earth-500/50 bg-earth-500/10'
                        : 'border-border hover:border-earth-500/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{t.icon}</div>
                    <div className="text-sm font-medium leading-tight">{t.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.duration} days · {t.targetReductionPct}% target</div>
                  </button>
                ))}
              </div>

              {selectedTemplate && (
                <div className="bg-secondary/30 rounded-lg p-3 mb-5 text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createChallenge}
                  disabled={!selectedTemplate || creating}
                  className="flex-1 py-2.5 rounded-lg bg-earth-500 hover:bg-earth-400 text-white text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Challenge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
