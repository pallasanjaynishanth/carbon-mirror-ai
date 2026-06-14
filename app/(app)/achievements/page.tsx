'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import type { Achievement, AchievementId } from '@/types'

const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'eco_beginner',
    title: 'Eco Beginner',
    description: 'Log your first activity and see your carbon mirror for the first time.',
    icon: '🌱',
    rarity: 'common',
    requirement: 'Log 1 activity',
    progress: 100,
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'carbon_reducer',
    title: 'Carbon Reducer',
    description: 'Keep your weekly footprint under 50 kg CO₂ for 2 consecutive weeks.',
    icon: '📉',
    rarity: 'rare',
    requirement: 'Under 50 kg/week × 2',
    progress: 65,
  },
  {
    id: 'climate_hero',
    title: 'Climate Hero',
    description: 'Reduce your monthly emissions by 30% compared to your baseline.',
    icon: '🦸',
    rarity: 'epic',
    requirement: '30% monthly reduction',
    progress: 40,
  },
  {
    id: 'green_champion',
    title: 'Green Champion',
    description: 'Win a community challenge and inspire others to go green.',
    icon: '🏆',
    rarity: 'epic',
    requirement: 'Win 1 challenge',
    progress: 0,
  },
  {
    id: 'planet_guardian',
    title: 'Planet Guardian',
    description: 'Maintain an Earth Avatar health score above 80% for 30 days.',
    icon: '🌍',
    rarity: 'legendary',
    requirement: 'Avatar 80%+ for 30 days',
    progress: 20,
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Log activities every day for 7 consecutive days.',
    icon: '🔥',
    rarity: 'common',
    requirement: '7-day logging streak',
    progress: 57,
  },
  {
    id: 'streak_30',
    title: 'Habit Builder',
    description: 'Log activities every day for 30 consecutive days.',
    icon: '💪',
    rarity: 'rare',
    requirement: '30-day logging streak',
    progress: 13,
  },
  {
    id: 'first_scan',
    title: 'Receipt Scanner',
    description: 'Scan your first receipt or bill with AI analysis.',
    icon: '📸',
    rarity: 'common',
    requirement: 'Scan 1 receipt',
    progress: 0,
  },
  {
    id: 'challenge_winner',
    title: 'Challenge Champion',
    description: 'Finish #1 on any community challenge leaderboard.',
    icon: '🥇',
    rarity: 'legendary',
    requirement: 'Rank #1 in a challenge',
    progress: 0,
  },
  {
    id: 'team_player',
    title: 'Team Player',
    description: 'Join 3 different community challenges.',
    icon: '🤝',
    rarity: 'rare',
    requirement: 'Join 3 challenges',
    progress: 33,
  },
]

const rarityConfig = {
  common:    { label: 'Common',    color: 'text-smoke-400',   bg: 'bg-smoke-700/30',   border: 'border-smoke-700',  glow: '' },
  rare:      { label: 'Rare',      color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
  epic:      { label: 'Epic',      color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]' },
  legendary: { label: 'Legendary', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.25)]' },
}

export default function AchievementsPage() {
  const unlocked = ALL_ACHIEVEMENTS.filter(a => a.unlockedAt)
  const inProgress = ALL_ACHIEVEMENTS.filter(a => !a.unlockedAt && (a.progress || 0) > 0)
  const locked = ALL_ACHIEVEMENTS.filter(a => !a.unlockedAt && !a.progress)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Achievements</h1>
        <p className="text-muted-foreground text-sm">
          Your milestones on the path to planetary stewardship.
        </p>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-earth-500/5 border border-earth-500/20 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">{unlocked.length}</div>
          <div className="text-xs text-muted-foreground">Unlocked</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-3xl mb-1">{inProgress.length}</div>
          <div className="text-xs text-muted-foreground">In Progress</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-3xl mb-1">{ALL_ACHIEVEMENTS.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="bg-card rounded-xl border border-border p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Overall Progress</div>
          <div className="text-sm text-muted-foreground">{unlocked.length}/{ALL_ACHIEVEMENTS.length}</div>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-earth-500"
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked.length / ALL_ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="mb-8">
          <div className="text-sm font-semibold text-earth-400 mb-4">✓ Unlocked</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked.map((a, i) => <AchievementCard key={a.id} achievement={a} index={i} />)}
          </div>
        </div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="mb-8">
          <div className="text-sm font-semibold text-amber-400 mb-4">⏳ In Progress</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((a, i) => <AchievementCard key={a.id} achievement={a} index={i} />)}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-muted-foreground mb-4">🔒 Locked</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locked.map((a, i) => <AchievementCard key={a.id} achievement={a} index={i} locked />)}
          </div>
        </div>
      )}
    </div>
  )
}

function AchievementCard({ achievement, index, locked }: { achievement: Achievement; index: number; locked?: boolean }) {
  const rc = rarityConfig[achievement.rarity]
  const isUnlocked = !!achievement.unlockedAt

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-xl border p-5 transition-all relative overflow-hidden ${
        locked
          ? 'bg-card border-border opacity-50'
          : `${rc.bg} ${rc.border} ${rc.glow}`
      }`}
    >
      {/* Rarity badge */}
      <div className={`absolute top-3 right-3 text-[10px] font-medium ${rc.color} uppercase tracking-wider`}>
        {rc.label}
      </div>

      <div className={`text-4xl mb-3 ${locked ? 'grayscale' : ''}`}>
        {locked ? '🔒' : achievement.icon}
      </div>

      <div className="font-semibold mb-1">{achievement.title}</div>
      <div className="text-xs text-muted-foreground mb-3 leading-relaxed">{achievement.description}</div>

      {/* Progress */}
      {!locked && !isUnlocked && achievement.progress !== undefined && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span>{achievement.requirement}</span>
            <span>{achievement.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${rc.color.replace('text-', 'bg-')}`}
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progress}%` }}
              transition={{ duration: 0.8, delay: index * 0.06 }}
            />
          </div>
        </div>
      )}

      {isUnlocked && (
        <div className="text-xs text-earth-400 font-medium">
          ✓ Unlocked {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}
        </div>
      )}

      {locked && (
        <div className="text-xs text-muted-foreground">{achievement.requirement}</div>
      )}
    </motion.div>
  )
}
