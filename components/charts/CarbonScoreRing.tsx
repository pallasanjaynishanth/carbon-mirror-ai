'use client'

import { motion } from 'framer-motion'

interface CarbonScoreRingProps {
  score: number // 0-1000
  weeklyKg: number
}

export function CarbonScoreRing({ score, weeklyKg }: CarbonScoreRingProps) {
  const pct = score / 1000
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)

  const getColor = () => {
    if (score >= 700) return '#22c55e'
    if (score >= 400) return '#f59e0b'
    return '#ef4444'
  }

  const getLabel = () => {
    if (score >= 800) return 'Excellent'
    if (score >= 600) return 'Good'
    if (score >= 400) return 'Average'
    if (score >= 200) return 'Needs work'
    return 'Critical'
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="text-sm font-semibold mb-4">Carbon Score</div>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            {/* Background ring */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="10"
            />
            {/* Progress ring */}
            <motion.circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold"
            >
              {score}
            </motion.div>
            <div className="text-[10px] text-muted-foreground">/ 1000</div>
          </div>
        </div>
      </div>
      <div className="text-center mt-3">
        <div className="text-sm font-medium" style={{ color: getColor() }}>{getLabel()}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{weeklyKg.toFixed(1)} kg CO₂ this week</div>
      </div>
    </div>
  )
}
