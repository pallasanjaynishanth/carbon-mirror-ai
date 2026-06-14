'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const PREVIEW_ACHIEVEMENTS = [
  { icon: '🌱', title: 'Eco Beginner', unlocked: true },
  { icon: '🔥', title: '7-Day Streak', unlocked: false, progress: 57 },
  { icon: '📉', title: 'Carbon Reducer', unlocked: false, progress: 65 },
]

export function AchievementRow() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold">Achievements</div>
        <Link href="/achievements" className="text-xs text-earth-400 hover:text-earth-300 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {PREVIEW_ACHIEVEMENTS.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
              a.unlocked ? 'bg-earth-500/10' : 'bg-secondary'
            }`}>
              {a.unlocked ? a.icon : '🔒'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{a.title}</div>
              {!a.unlocked && a.progress !== undefined && (
                <div className="h-1 rounded-full bg-secondary overflow-hidden mt-1">
                  <div className="h-full rounded-full bg-earth-500/60" style={{ width: `${a.progress}%` }} />
                </div>
              )}
            </div>
            {a.unlocked && <span className="text-xs text-earth-400 font-medium">✓</span>}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
