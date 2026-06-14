'use client'

import { motion } from 'framer-motion'
import { Sparkles, TrendingDown, Lightbulb } from 'lucide-react'
import type { CarbonStory } from '@/types'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/utils'

const moodConfig = {
  excellent: { color: 'text-earth-400', bg: 'from-earth-500/20 to-earth-500/5', emoji: '🌟' },
  good:      { color: 'text-green-400', bg: 'from-green-500/20 to-green-500/5', emoji: '🌿' },
  neutral:   { color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5', emoji: '⚖️' },
  poor:      { color: 'text-orange-400', bg: 'from-orange-500/20 to-orange-500/5', emoji: '⚠️' },
  critical:  { color: 'text-red-400', bg: 'from-red-500/20 to-red-500/5', emoji: '🔥' },
}

export function WeeklyStoryCard({ story }: { story: CarbonStory }) {
  const config = moodConfig[story.mood] || moodConfig.neutral

  return (
    <div className={`rounded-xl border border-white/5 bg-gradient-to-br ${config.bg} overflow-hidden`}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-earth-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-sm">Your Weekly Carbon Story</div>
            <span className="text-lg">{config.emoji}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            AI-generated · {CATEGORY_ICONS[story.topCategory]} {CATEGORY_LABELS[story.topCategory]} was your top category
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold">{story.totalCo2Kg.toFixed(1)}</div>
          <div className="text-[10px] text-muted-foreground">kg CO₂</div>
        </div>
      </div>

      {/* Narrative */}
      <div className="px-6 pb-5">
        <p className="text-sm text-muted-foreground leading-relaxed prose-carbon">
          {story.narrative}
        </p>

        {/* Reduction highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-earth-500/10 border border-earth-500/20"
        >
          <TrendingDown className="w-4 h-4 text-earth-400 shrink-0" />
          <span className="text-sm">
            <span className="font-semibold text-earth-400">{story.reductionPct}% reduction</span>{' '}
            <span className="text-muted-foreground">possible with small changes</span>
          </span>
        </motion.div>

        {/* Tips */}
        {story.tips?.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lightbulb className="w-3.5 h-3.5" />
              Personalized suggestions
            </div>
            {story.tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-2 text-sm pl-1"
              >
                <span className="text-earth-400 mt-0.5">→</span>
                <span className="text-foreground/90">{tip}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
