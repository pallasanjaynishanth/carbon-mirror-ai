'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { CarbonEquivalent } from '@/types'
import { getSeverity } from '@/features/carbon-engine/calculations'
import { Save, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RealityCardProps {
  label: string
  co2Kg: number
  equivalents: CarbonEquivalent[]
  loadingAI?: boolean
  onSave?: () => void
  saving?: boolean
  saved?: boolean
}

const severityConfig = {
  low:      { color: 'text-earth-400',  bg: 'bg-earth-400/10',  border: 'border-earth-400/20',  label: 'Low Impact',      emoji: '🟢' },
  medium:   { color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20',  label: 'Medium Impact',   emoji: '🟡' },
  high:     { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', label: 'High Impact',     emoji: '🟠' },
  critical: { color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    label: 'Critical Impact', emoji: '🔴' },
}

export function RealityCard({ label, co2Kg, equivalents, loadingAI, onSave, saving, saved }: RealityCardProps) {
  const severity = getSeverity(co2Kg)
  const config = severityConfig[severity]

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} overflow-hidden`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={`text-xs font-medium ${config.color} mb-1 flex items-center gap-1.5`}>
              <span>{config.emoji}</span>
              {config.label}
            </div>
            <h2 className="text-xl font-bold tracking-tight">{label}</h2>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold">{co2Kg.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">kg CO₂</div>
          </div>
        </div>
      </div>

      {/* Equivalents */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-sm font-semibold">This is equivalent to</div>
          {loadingAI && (
            <div className="flex items-center gap-1 text-xs text-earth-400">
              <Sparkles className="w-3 h-3 animate-pulse" />
              AI generating...
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {equivalents.map((eq, i) => (
              <motion.div
                key={`${eq.icon}-${i}`}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.06 }}
                className="bg-background/40 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="text-3xl mb-2">{eq.icon}</div>
                <div className="text-2xl font-bold leading-none mb-0.5">{eq.formattedValue}</div>
                <div className={`text-xs font-semibold ${config.color} mb-1`}>{eq.unit}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{eq.description}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading skeleton */}
          {loadingAI && equivalents.length === 0 && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-background/40 rounded-xl p-4 border border-white/5">
              <div className="shimmer h-8 w-8 rounded mb-2" />
              <div className="shimmer h-6 w-16 rounded mb-1.5" />
              <div className="shimmer h-3 w-12 rounded mb-1" />
              <div className="shimmer h-3 w-20 rounded" />
            </div>
          ))}
        </div>

        {/* CO₂ context bar */}
        <div className="mt-4 p-4 rounded-xl bg-background/30 border border-white/5">
          <div className="text-xs text-muted-foreground mb-2">
            Global daily carbon budget per person
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-black/20 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  severity === 'low' ? 'bg-earth-400' :
                  severity === 'medium' ? 'bg-amber-400' :
                  severity === 'high' ? 'bg-orange-400' : 'bg-red-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (co2Kg / 15) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-medium shrink-0">
              {((co2Kg / 15) * 100).toFixed(0)}% of daily budget
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            To limit warming to 1.5°C, each person should emit ≤15 kg CO₂/day
          </div>
        </div>

        {/* Save button */}
        {onSave && (
          <div className="mt-4">
            <button
              onClick={onSave}
              disabled={saving || saved}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
                saved
                  ? 'bg-earth-500/20 text-earth-400 border border-earth-500/30 cursor-default'
                  : 'bg-earth-500 hover:bg-earth-400 text-white shadow-glow hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
              )}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Logged to your mirror</>
              ) : (
                <><Save className="w-4 h-4" /> Log this activity</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
