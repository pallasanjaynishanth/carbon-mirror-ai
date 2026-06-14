'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useAuth } from '@/components/layout/AuthProvider'
import { calculateEquivalents, CATEGORY_DEFAULTS } from '@/features/carbon-engine/calculations'
import { RealityCard } from '@/components/cards/RealityCard'
import toast from 'react-hot-toast'
import type { ActivityCategory, CarbonEquivalent } from '@/types'
import { Plane, Car, Utensils, Zap, ShoppingBag, Plus, Loader2 } from 'lucide-react'

const ACTIVITIES = [
  {
    category: 'flight' as ActivityCategory,
    icon: Plane,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/20',
    label: 'Flight',
    examples: [
      { label: 'Mumbai → Delhi (1h 50m)', km: 1148, description: 'Domestic flight' },
      { label: 'Delhi → London (9h)', km: 6727, description: 'International flight' },
      { label: 'Chennai → Singapore (3h 30m)', km: 2874, description: 'Regional flight' },
    ],
  },
  {
    category: 'transport' as ActivityCategory,
    icon: Car,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    label: 'Transport',
    examples: [
      { label: 'Office commute (15km)', km: 15, description: 'Daily car commute' },
      { label: 'Rideshare (25km)', km: 25, description: 'Cab/auto ride' },
      { label: 'Intercity drive (200km)', km: 200, description: 'Highway drive' },
    ],
  },
  {
    category: 'food' as ActivityCategory,
    icon: Utensils,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    label: 'Food',
    examples: [
      { label: 'Food delivery (1 order)', km: 1, description: 'Delivery + packaging' },
      { label: 'Beef burger (300g)', km: 1, description: 'Beef is carbon-intensive' },
      { label: 'Restaurant meal (veg)', km: 1, description: 'Vegetarian meal' },
    ],
  },
  {
    category: 'energy' as ActivityCategory,
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    label: 'Energy',
    examples: [
      { label: 'Monthly electricity bill (200 kWh)', km: 200, description: 'Home electricity' },
      { label: 'AC usage (8 hours)', km: 8, description: 'Air conditioning' },
      { label: 'Monthly gas (5 kg LPG)', km: 5, description: 'Cooking gas' },
    ],
  },
  {
    category: 'shopping' as ActivityCategory,
    icon: ShoppingBag,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    label: 'Shopping',
    examples: [
      { label: 'New smartphone', km: 1, description: '~70kg CO₂ to manufacture' },
      { label: 'Clothing item (fast fashion)', km: 1, description: 'T-shirt, jeans, etc.' },
      { label: 'Online order delivery', km: 1, description: 'Last-mile delivery' },
    ],
  },
]

interface LogEntry {
  category: ActivityCategory
  label: string
  description: string
  amount: number
  unit: string
  co2Kg: number
}

export default function RealityPage() {
  const { user } = useAuth()
  const [selected, setSelected] = useState<typeof ACTIVITIES[0] | null>(null)
  const [customLabel, setCustomLabel] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [equivalents, setEquivalents] = useState<CarbonEquivalent[]>([])
  const [aiEquivalents, setAiEquivalents] = useState<CarbonEquivalent[]>([])
  const [co2Kg, setCo2Kg] = useState(0)
  const [logging, setLogging] = useState(false)
  const [loadingAI, setLoadingAI] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleQuickPick(activity: typeof ACTIVITIES[0], example: typeof ACTIVITIES[0]['examples'][0]) {
    setSelected(activity)
    setCustomLabel(example.label)
    setCustomAmount(String(example.km))

    const factor = CATEGORY_DEFAULTS[activity.category].factor
    const co2 = example.km * factor
    const parsed = isNaN(co2) ? 0 : co2
    setCo2Kg(parsed)
    setEquivalents(calculateEquivalents(parsed))
    setAiEquivalents([])
    setSaved(false)
  }

  async function handleCustomCalculate() {
    if (!selected || !customAmount) return
    const amount = parseFloat(customAmount)
    if (isNaN(amount) || amount <= 0) return

    const factor = CATEGORY_DEFAULTS[selected.category].factor
    const co2 = amount * factor
    setCo2Kg(co2)
    setEquivalents(calculateEquivalents(co2))
    setSaved(false)

    // Also fetch AI equivalents
    setLoadingAI(true)
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'equivalents', co2Kg: co2, label: customLabel }),
      })
      const data = await res.json()
      if (data.success) setAiEquivalents(data.equivalents)
    } catch {
      // fallback to static
    } finally {
      setLoadingAI(false)
    }
  }

  async function handleSave() {
    if (!user || co2Kg === 0) return
    setLogging(true)
    try {
      await addDoc(collection(db, 'activities'), {
        userId: user.uid,
        category: selected?.category || 'other',
        label: customLabel || 'Activity',
        co2Kg,
        amount: parseFloat(customAmount) || 1,
        unit: selected ? CATEGORY_DEFAULTS[selected.category].unit : 'unit',
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setSaved(true)
      toast.success('Activity logged! Your mirror reflects this.')
    } catch {
      toast.error('Failed to save. Try again.')
    } finally {
      setLogging(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Log Activity</h1>
        <p className="text-muted-foreground text-sm">
          See the real human cost of your everyday choices.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {ACTIVITIES.map((act) => (
          <button
            key={act.category}
            onClick={() => { setSelected(act); setCo2Kg(0); setEquivalents([]); setSaved(false) }}
            className={`p-4 rounded-xl border transition-all text-left ${
              selected?.category === act.category
                ? `${act.bg} ${act.border} border`
                : 'bg-card border-border hover:border-border/80 hover:bg-secondary/50'
            }`}
          >
            <act.icon className={`w-5 h-5 mb-2 ${act.color}`} />
            <div className="text-sm font-medium">{act.label}</div>
          </button>
        ))}
      </div>

      {selected && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Quick picks */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="text-sm font-semibold mb-4">Quick picks</div>
              <div className="space-y-2">
                {selected.examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPick(selected, ex)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary/50 hover:border-border/80 transition-all group"
                  >
                    <div className="text-sm font-medium group-hover:text-foreground">{ex.label}</div>
                    <div className="text-xs text-muted-foreground">{ex.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom entry */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="text-sm font-semibold mb-4">Custom entry</div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
                  <input
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    placeholder={`e.g. Commute to work`}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Amount ({CATEGORY_DEFAULTS[selected.category].unit})
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <button
                  onClick={handleCustomCalculate}
                  disabled={!customAmount || !customLabel}
                  className="w-full py-2.5 rounded-lg bg-earth-500 hover:bg-earth-400 text-white text-sm font-medium transition-all disabled:opacity-50"
                >
                  Calculate Impact
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Reality Card */}
      <AnimatePresence>
        {co2Kg > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
          >
            <RealityCard
              label={customLabel}
              co2Kg={co2Kg}
              equivalents={aiEquivalents.length > 0 ? aiEquivalents : equivalents}
              loadingAI={loadingAI}
              onSave={handleSave}
              saving={logging}
              saved={saved}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
