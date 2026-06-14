'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/utils'

interface CategoryBreakdownProps {
  data: Record<string, number>
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])

  const total = entries.reduce((s, [, v]) => s + v, 0)

  const chartData = entries.map(([category, value]) => ({
    name: category,
    value,
    pct: total > 0 ? (value / total) * 100 : 0,
  }))

  if (entries.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="text-sm font-semibold mb-4">Category Breakdown</div>
        <div className="text-center py-8 text-sm text-muted-foreground">
          No activities logged this week yet.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="text-sm font-semibold mb-4">Category Breakdown</div>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={28}
                outerRadius={42}
                paddingAngle={2}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#a8a29e'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: number) => [`${value.toFixed(1)} kg`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          {chartData.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#a8a29e' }}
              />
              <span className="text-muted-foreground">{CATEGORY_ICONS[entry.name]}</span>
              <span className="flex-1 truncate">{CATEGORY_LABELS[entry.name] || entry.name}</span>
              <span className="font-medium text-xs">{entry.pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
