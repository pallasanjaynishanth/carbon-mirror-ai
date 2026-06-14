'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useAuth } from '@/components/layout/AuthProvider'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { Activity } from '@/types'
import { TrendingDown, Leaf, DollarSign, TreePine, Loader2 } from 'lucide-react'

type Timeframe = '1m' | '6m' | '12m'

interface SimData {
  current: number[]
  sustainable: number[]
  insights: string[]
}

const timeframeLabels: Record<Timeframe, string> = {
  '1m': '1 Month',
  '6m': '6 Months',
  '12m': '12 Months',
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function SimulatorPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [timeframe, setTimeframe] = useState<Timeframe>('6m')
  const [simData, setSimData] = useState<SimData | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

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
    setFetching(false)
  }, [user])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  async function runSimulation() {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities, timeframe }),
      })
      const data = await res.json()
      if (data.success) setSimData(data.simulation)
    } catch {
      // fallback local sim
      const months = timeframe === '1m' ? 1 : timeframe === '6m' ? 6 : 12
      const avgMonthly = activities.reduce((s, a) => s + a.co2Kg, 0) / Math.max(1, months)
      const current = Array.from({ length: months }, (_, i) => avgMonthly * (1 + Math.sin(i * 0.5) * 0.1))
      const sustainable = current.map((v, i) => v * (1 - i * 0.04))
      setSimData({ current, sustainable, insights: ['Switching to public transport could save 20% of your emissions.', 'Reducing meat consumption twice a week saves significant CO₂.', 'Solar energy adoption would eliminate your electricity footprint.'] })
    } finally {
      setLoading(false)
    }
  }

  const chartData = simData ? simData.current.map((v, i) => ({
    month: MONTH_LABELS[(new Date().getMonth() + i) % 12],
    current: parseFloat(v.toFixed(1)),
    sustainable: parseFloat(simData.sustainable[i].toFixed(1)),
  })) : []

  const totalCurrent = simData?.current.reduce((s, v) => s + v, 0) || 0
  const totalSustainable = simData?.sustainable.reduce((s, v) => s + v, 0) || 0
  const saved = totalCurrent - totalSustainable
  const treesEquiv = Math.round(saved / 21.7)
  const moneySaved = Math.round(saved * 0.5) // ~₹0.5 per kg CO₂ proxy

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Future Simulator</h1>
        <p className="text-muted-foreground text-sm">
          Compare your current path with a sustainable one. See what&apos;s possible.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <div className="text-sm font-semibold mb-2">Prediction timeframe</div>
            <div className="flex gap-2">
              {(['1m', '6m', '12m'] as Timeframe[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTimeframe(t); setSimData(null) }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeframe === t
                      ? 'bg-earth-500 text-white shadow-glow-sm'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {timeframeLabels[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:ml-auto">
            <button
              onClick={runSimulation}
              disabled={loading || fetching || activities.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-earth-500 hover:bg-earth-400 text-white font-semibold transition-all disabled:opacity-60 shadow-glow"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Simulating...</>
              ) : (
                <><TrendingDown className="w-4 h-4" /> Run Simulation</>
              )}
            </button>
          </div>
        </div>
        {activities.length === 0 && !fetching && (
          <div className="mt-3 text-xs text-amber-400">
            Log some activities first to run a meaningful simulation.
          </div>
        )}
      </div>

      <AnimatePresence>
        {simData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Outcome cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: TrendingDown, label: 'CO₂ Saved', value: `${saved.toFixed(0)} kg`, color: 'text-earth-400', bg: 'bg-earth-400/10' },
                { icon: TreePine, label: 'Trees Equivalent', value: `${treesEquiv}`, color: 'text-green-400', bg: 'bg-green-400/10' },
                { icon: DollarSign, label: 'Money Saved', value: `₹${moneySaved.toLocaleString()}`, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                { icon: Leaf, label: 'Reduction', value: `${totalCurrent > 0 ? ((saved / totalCurrent) * 100).toFixed(0) : 0}%`, color: 'text-teal-400', bg: 'bg-teal-400/10' },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`${card.bg} rounded-xl p-4 border border-white/5`}
                >
                  <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
                  <div className="text-2xl font-bold mb-0.5">{card.value}</div>
                  <div className="text-xs text-muted-foreground">{card.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Side by side paths */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                <div className="text-xs text-red-400 font-medium mb-1">Current Path</div>
                <div className="text-2xl font-bold mb-0.5">{totalCurrent.toFixed(0)} kg CO₂</div>
                <div className="text-xs text-muted-foreground">Over {timeframeLabels[timeframe]}</div>
              </div>
              <div className="bg-earth-500/5 border border-earth-500/20 rounded-xl p-5">
                <div className="text-xs text-earth-400 font-medium mb-1">Sustainable Path</div>
                <div className="text-2xl font-bold mb-0.5">{totalSustainable.toFixed(0)} kg CO₂</div>
                <div className="text-xs text-muted-foreground">Over {timeframeLabels[timeframe]}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-sm font-semibold">Emission Forecast</div>
                <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-red-400" />
                    Current path
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-earth-400" />
                    Sustainable path
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="sustainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} unit=" kg" />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="current" stroke="#f87171" strokeWidth={2} fill="url(#currentGrad)" name="Current" />
                  <Area type="monotone" dataKey="sustainable" stroke="#22c55e" strokeWidth={2} fill="url(#sustainGrad)" name="Sustainable" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* AI Insights */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="text-sm font-semibold mb-4">AI Insights</div>
              <div className="space-y-3">
                {simData.insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <div className="w-5 h-5 rounded-full bg-earth-500/20 text-earth-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {insight}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
