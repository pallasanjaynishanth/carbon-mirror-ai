'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export function QuickLogButton({ onLogged }: { onLogged?: () => void }) {
  return (
    <Link href="/reality">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-earth-500 hover:bg-earth-400 text-white text-sm font-medium transition-all shadow-glow-sm"
      >
        <Plus className="w-4 h-4" />
        Log Activity
      </motion.button>
    </Link>
  )
}
