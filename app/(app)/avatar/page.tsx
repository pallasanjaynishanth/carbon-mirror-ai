'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useAuth } from '@/components/layout/AuthProvider'
import { calculateAvatarHealth, healthToBiome } from '@/features/carbon-engine/calculations'
import { subDays } from 'date-fns'
import type { Activity } from '@/types'
import Link from 'next/link'
import { ArrowRight, Leaf, Droplets, Wind, Thermometer } from 'lucide-react'

const biomeConfig = {
  thriving: {
    bg: 'from-emerald-950 via-green-900 to-green-800',
    sky: 'from-blue-900/60 to-transparent',
    label: 'Thriving Ecosystem',
    desc: 'Your planet is flourishing. Forests are dense, rivers run clean, wildlife thrives.',
    color: 'text-emerald-400',
    elements: ['🌲', '🌳', '🦋', '🐦', '🌸', '🍃', '🌊', '🦌'],
    pollution: 0,
  },
  healthy: {
    bg: 'from-green-950 via-green-900 to-emerald-800',
    sky: 'from-blue-800/50 to-transparent',
    label: 'Healthy Ecosystem',
    desc: 'Your planet is in good shape. Keep making sustainable choices to help it thrive.',
    color: 'text-green-400',
    elements: ['🌲', '🌳', '🐦', '🌿', '🍃', '🌊'],
    pollution: 0.1,
  },
  stressed: {
    bg: 'from-yellow-950 via-stone-900 to-green-900',
    sky: 'from-yellow-900/30 to-transparent',
    label: 'Stressed Ecosystem',
    desc: 'Signs of strain are showing. Your choices are putting pressure on the natural world.',
    color: 'text-yellow-400',
    elements: ['🌲', '🌿', '🍂', '🌫️'],
    pollution: 0.3,
  },
  degraded: {
    bg: 'from-stone-950 via-stone-900 to-yellow-950',
    sky: 'from-orange-900/30 to-transparent',
    label: 'Degraded Ecosystem',
    desc: 'Your planet is suffering. Forests are thinning, rivers are drying up.',
    color: 'text-orange-400',
    elements: ['🌵', '🍂', '🌫️', '💨'],
    pollution: 0.6,
  },
  critical: {
    bg: 'from-stone-950 via-zinc-950 to-red-950',
    sky: 'from-red-900/20 to-transparent',
    label: 'Critical State',
    desc: 'Your planet is in crisis. Immediate action is needed to prevent irreversible damage.',
    color: 'text-red-400',
    elements: ['🔥', '💨', '🌫️', '🌵'],
    pollution: 0.9,
  },
}

interface EcologyMetric {
  label: string
  icon: typeof Leaf
  value: number
  color: string
}

export default function EarthAvatarPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeParticles, setActiveParticles] = useState<number[]>([])

  const weeklyActivities = activities.filter(a => new Date(a.date) >= subDays(new Date(), 7))
  const health = calculateAvatarHealth(weeklyActivities)
  const biome = healthToBiome(health) as keyof typeof biomeConfig
  const config = biomeConfig[biome]

  const metrics: EcologyMetric[] = [
    { label: 'Forest Cover',   icon: Leaf,        value: Math.min(100, health * 1.1),    color: 'bg-emerald-500' },
    { label: 'Water Quality',  icon: Droplets,    value: Math.min(100, health * 0.95),   color: 'bg-blue-500' },
    { label: 'Air Quality',    icon: Wind,        value: Math.max(10, 100 - config.pollution * 100), color: 'bg-sky-400' },
    { label: 'Temperature',    icon: Thermometer, value: Math.max(20, 100 - config.pollution * 80), color: 'bg-amber-500' },
  ]

  useEffect(() => {
    setActiveParticles(Array.from({ length: 12 }, (_, i) => i))
  }, [])

  const fetchActivities = useCallback(async () => {
    if (!user) return
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(30)
    )
    const snap = await getDocs(q)
    setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity)))
    setLoading(false)
  }, [user])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Earth Avatar</h1>
          <p className="text-muted-foreground text-sm">
            Your living digital ecosystem, shaped by your choices.
          </p>
        </div>

        {/* Main Avatar */}
        <div className="grid lg:grid-cols-5 gap-6 mb-6">
          {/* Avatar viewport */}
          <div className="lg:col-span-3">
            <div
              className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b ${config.bg} border border-white/10 shadow-deep`}
            >
              {/* Sky layer */}
              <div className={`absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b ${config.sky}`} />

              {/* Pollution overlay */}
              {config.pollution > 0 && (
                <motion.div
                  className="absolute inset-0 bg-amber-900/30 backdrop-blur-[1px]"
                  style={{ opacity: config.pollution * 0.6 }}
                  animate={{ opacity: [config.pollution * 0.4, config.pollution * 0.7, config.pollution * 0.4] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              )}

              {/* Floating ecosystem elements */}
              <div className="absolute inset-0">
                {activeParticles.map((i) => {
                  const el = config.elements[i % config.elements.length]
                  return (
                    <motion.div
                      key={i}
                      className="absolute text-2xl md:text-4xl select-none"
                      style={{
                        left: `${10 + (i * 17) % 80}%`,
                        top: `${15 + (i * 13) % 60}%`,
                      }}
                      animate={{
                        y: [0, -12, 0],
                        x: [0, (i % 2 === 0 ? 6 : -6), 0],
                        opacity: [0.7, 1, 0.7],
                        rotate: [0, (i % 2 === 0 ? 5 : -5), 0],
                      }}
                      transition={{
                        duration: 3 + (i % 3),
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    >
                      {el}
                    </motion.div>
                  )
                })}
              </div>

              {/* Globe center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-center"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="text-8xl md:text-9xl mb-4 drop-shadow-2xl">🌍</div>
                </motion.div>
              </div>

              {/* Health overlay */}
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
                <div className={`text-xs font-medium ${config.color} mb-1`}>{config.label}</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${health >= 60 ? 'bg-earth-400' : health >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${health}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-white font-bold text-sm">{health}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-1">{config.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{config.desc}</p>
            </div>

            {metrics.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <m.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{m.label}</span>
                  <span className="ml-auto text-sm font-bold">{Math.round(m.value)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${m.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.value}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}

            {/* CTA */}
            <div className="bg-earth-500/5 border border-earth-500/20 rounded-xl p-4">
              <div className="text-sm font-medium mb-1">Improve your avatar</div>
              <div className="text-xs text-muted-foreground mb-3">
                Log sustainable activities to help your ecosystem thrive.
              </div>
              <Link
                href="/reality"
                className="flex items-center gap-2 text-earth-400 text-sm font-medium hover:text-earth-300 transition-colors"
              >
                Log an activity <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* History timeline */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Ecosystem Timeline</h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const dayActivities = activities.filter(a => {
                const d = new Date(a.date)
                return d >= subDays(new Date(), 6 - i) && d < subDays(new Date(), 5 - i)
              })
              const dayHealth = calculateAvatarHealth(dayActivities)
              const isToday = i === 6
              return (
                <div key={i} className="text-center">
                  <div className={`text-2xl mb-1.5 ${isToday ? 'scale-125 transform' : ''}`}>
                    {dayHealth >= 80 ? '🌳' : dayHealth >= 60 ? '🌿' : dayHealth >= 40 ? '🍂' : '🌵'}
                  </div>
                  <div className="h-16 w-full rounded bg-secondary/50 relative overflow-hidden">
                    <motion.div
                      className={`absolute bottom-0 w-full rounded ${dayHealth >= 60 ? 'bg-earth-500/60' : dayHealth >= 40 ? 'bg-amber-500/60' : 'bg-red-500/60'}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${dayHealth}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {isToday ? 'Today' : `D-${6 - i}`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
