'use client'

import { motion } from 'framer-motion'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/client'
import type { Activity } from '@/types'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface ActivityFeedProps {
  activities: Activity[]
  onRefresh: () => void
}

export function ActivityFeed({ activities, onRefresh }: ActivityFeedProps) {
  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, 'activities', id))
      toast.success('Activity removed')
      onRefresh()
    } catch {
      toast.error('Failed to remove')
    }
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <div className="text-3xl mb-2">📝</div>
        <div className="text-sm font-medium mb-1">No activities yet</div>
        <div className="text-xs text-muted-foreground">
          Start logging your daily activities to see your impact.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="text-sm font-semibold mb-4">Recent Activities</div>
      <div className="space-y-1">
        {activities.map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-base shrink-0">
              {CATEGORY_ICONS[activity.category] || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{activity.label}</div>
              <div className="text-xs text-muted-foreground">
                {CATEGORY_LABELS[activity.category]} · {format(new Date(activity.date), 'MMM d')}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-sm font-semibold ${
                activity.co2Kg > 10 ? 'text-red-400' : activity.co2Kg > 2 ? 'text-amber-400' : 'text-earth-400'
              }`}>
                {activity.co2Kg.toFixed(1)} kg
              </div>
            </div>
            <button
              onClick={() => handleDelete(activity.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
