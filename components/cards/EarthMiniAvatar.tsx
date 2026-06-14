'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { healthToBiome } from '@/features/carbon-engine/calculations'
import { ArrowRight } from 'lucide-react'

const biomeStyles: Record<string, { bg: string; emoji: string; label: string; color: string }> = {
  thriving: { bg: 'biome-healthy', emoji: '🌍', label: 'Thriving', color: 'text-emerald-400' },
  healthy:  { bg: 'biome-healthy', emoji: '🌍', label: 'Healthy', color: 'text-green-400' },
  stressed: { bg: 'biome-degraded', emoji: '🌎', label: 'Stressed', color: 'text-amber-400' },
  degraded: { bg: 'biome-degraded', emoji: '🌎', label: 'Degraded', color: 'text-orange-400' },
  critical: { bg: 'biome-critical', emoji: '🌑', label: 'Critical', color: 'text-red-400' },
}

export function EarthMiniAvatar({ health }: { health: number }) {
  const biome = healthToBiome(health)
  const style = biomeStyles[biome]

  return (
    <Link href="/avatar">
      <div className={`rounded-xl border border-white/5 ${style.bg} p-5 relative overflow-hidden card-hover cursor-pointer`}>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="text-xs text-white/60 mb-1">Earth Avatar</div>
            <div className={`text-sm font-semibold ${style.color}`}>{style.label} Ecosystem</div>
          </div>
          <motion.div
            className="text-5xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {style.emoji}
          </motion.div>
        </div>

        <div className="mt-4 relative z-10">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-white/60">Health</span>
            <span className="text-white font-semibold">{health}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-earth-400"
              initial={{ width: 0 }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs text-white/50 relative z-10">
          View ecosystem <ArrowRight className="w-3 h-3" />
        </div>

        {/* Floating particles */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-sm opacity-30"
            style={{ left: `${20 + i * 20}%`, top: `${30 + (i % 2) * 30}%` }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          >
            {biome === 'thriving' || biome === 'healthy' ? '🌿' : biome === 'critical' ? '💨' : '🍂'}
          </motion.div>
        ))}
      </div>
    </Link>
  )
}
