'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface WeeklyTrendChartProps {
  data: { date: string; co2Kg: number }[]
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const max = Math.max(...data.map(d => d.co2Kg), 1)

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold">7-Day Emissions Trend</div>
        <div className="text-xs text-muted-foreground">
          Total: {data.reduce((s, d) => s + d.co2Kg, 0).toFixed(1)} kg
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} unit="kg" width={45} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value: number) => [`${value.toFixed(1)} kg CO₂`, '']}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="co2Kg" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.co2Kg / max > 0.7 ? '#f87171'
                  : entry.co2Kg / max > 0.4 ? '#fbbf24'
                  : '#22c55e'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
