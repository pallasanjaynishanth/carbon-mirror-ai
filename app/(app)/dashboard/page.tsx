'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useAuth } from '@/components/layout/AuthProvider'
import { WeeklyStoryCard } from '@/components/cards/WeeklyStoryCard'
import { CarbonScoreRing } from '@/components/charts/CarbonScoreRing'
import { ActivityFeed } from '@/components/cards/ActivityFeed'
import { CategoryBreakdown } from '@/components/charts/CategoryBreakdown'
import { WeeklyTrendChart } from '@/components/charts/WeeklyTrendChart'
import { AchievementRow } from '@/components/cards/AchievementRow'
import { QuickLogButton } from '@/components/cards/QuickLogButton'
import { EarthMiniAvatar } from '@/components/cards/EarthMiniAvatar'
import { calculateCarbonScore, calculateAvatarHealth } from '@/features/carbon-engine/calculations'
import type { Activity, CarbonStory } from '@/types'
import { subDays, startOfWeek, format } from 'date-fns'
import { Sparkles, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [story, setStory] = useState<CarbonStory | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const weeklyActivities = activities.filter(a =>
    new Date(a.date) >= subDays(new Date(), 7)
  )
  const weeklyTotal = weeklyActivities.reduce((s, a) => s + a.co2Kg, 0)
  const prevWeekActivities = activities.filter(a => {
    const d = new Date(a.date)
    return d >= subDays(new Date(), 14) && d < subDays(new Date(), 7)
  })
  const prevWeekTotal = prevWeekActivities.reduce((s, a) => s + a.co2Kg, 0)
  const changePct = prevWeekTotal > 0 ? ((weeklyTotal - prevWeekTotal) / prevWeekTotal) * 100 : 0

  const carbonScore = calculateCarbonScore(weeklyTotal)
  const avatarHealth = calculateAvatarHealth(weeklyActivities)

  const categoryData = weeklyActivities.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + a.co2Kg
    return acc
  }, {})

  // Build 7-day trend
  const trend = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayStr = format(date, 'yyyy-MM-dd')
    const dayTotal = activities
      .filter(a => a.date.startsWith(dayStr))
      .reduce((s, a) => s + a.co2Kg, 0)
    return { date: format(date, 'EEE'), co2Kg: dayTotal }
  })

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(50)
      )
      const snap = await getDocs(q)
      const acts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity))
      setActivities(acts)

      // Fetch latest story
      const sq = query(
        collection(db, 'stories'),
        where('userId', '==', user.uid),
        orderBy('generatedAt', 'desc'),
        limit(1)
      )
      const sSnap = await getDocs(sq)
      if (!sSnap.empty) {
        setStory({ id: sSnap.docs[0].id, ...sSnap.docs[0].data() } as CarbonStory)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  async function generateStory() {
    if (!user || weeklyActivities.length === 0) return
    setGenerating(true)
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, activities: weeklyActivities }),
      })
      const data = await res.json()
      if (data.success) setStory(data.story)
    } finally {
      setGenerating(false)
    }
  }

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-sm mb-1"
          >
            {greeting}, {profile?.displayName?.split(' ')[0] || 'Explorer'}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl font-bold tracking-tight"
          >
            Your Carbon Mirror
          </motion.h1>
        </div>
        <QuickLogButton onLogged={fetchData} />
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Carbon Score',
            value: carbonScore,
            suffix: '',
            hint: 'This week',
            positive: carbonScore > 600,
          },
          {
            label: 'Weekly CO₂',
            value: weeklyTotal.toFixed(1),
            suffix: 'kg',
            hint: changePct === 0 ? 'vs last week' : `${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}% vs last week`,
            positive: changePct <= 0,
          },
          {
            label: 'Activities',
            value: weeklyActivities.length,
            suffix: '',
            hint: 'Logged this week',
            positive: true,
          },
          {
            label: 'Earth Health',
            value: avatarHealth,
            suffix: '%',
            hint: 'Ecosystem status',
            positive: avatarHealth >= 60,
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card rounded-xl p-4 border border-border card-hover"
          >
            <div className="text-xs text-muted-foreground mb-2">{s.label}</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-2xl font-bold">{s.value}</span>
              {s.suffix && <span className="text-sm text-muted-foreground mb-0.5">{s.suffix}</span>}
            </div>
            <div className={cn('text-xs flex items-center gap-1', s.positive ? 'text-earth-400' : 'text-amber-400')}>
              {s.label === 'Weekly CO₂' && changePct !== 0 && (
                changePct < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />
              )}
              {s.hint}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Story */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {story ? (
              <WeeklyStoryCard story={story} />
            ) : (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-earth-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-earth-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">AI Carbon Story</div>
                    <div className="text-xs text-muted-foreground">Personalized weekly narrative</div>
                  </div>
                </div>
                {weeklyActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Log some activities this week to generate your personalized carbon story.
                  </p>
                ) : (
                  <button
                    onClick={generateStory}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-earth-500 hover:bg-earth-400 text-white text-sm font-medium transition-all disabled:opacity-60"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generating ? 'Generating story...' : 'Generate my story'}
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Weekly trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <WeeklyTrendChart data={trend} />
          </motion.div>

          {/* Activity feed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <ActivityFeed activities={activities.slice(0, 8)} onRefresh={fetchData} />
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Earth Mini Avatar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <EarthMiniAvatar health={avatarHealth} />
          </motion.div>

          {/* Carbon Score ring */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <CarbonScoreRing score={carbonScore} weeklyKg={weeklyTotal} />
          </motion.div>

          {/* Category breakdown */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <CategoryBreakdown data={categoryData} />
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <AchievementRow />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
