import type { Activity, ActivityCategory, CarbonEquivalent } from '@/types'

// ─── Emission factors (kg CO₂ per unit) ──────────────────────────────────────
export const EMISSION_FACTORS: Record<string, { factor: number; unit: string; label: string }> = {
  // Transport
  car_km:         { factor: 0.171,  unit: 'km',    label: 'Car (petrol)' },
  car_km_ev:      { factor: 0.053,  unit: 'km',    label: 'Electric car' },
  bike_km:        { factor: 0.103,  unit: 'km',    label: 'Motorbike' },
  bus_km:         { factor: 0.089,  unit: 'km',    label: 'Bus' },
  train_km:       { factor: 0.041,  unit: 'km',    label: 'Train' },
  flight_km:      { factor: 0.255,  unit: 'km',    label: 'Flight (economy)' },
  rideshare_km:   { factor: 0.189,  unit: 'km',    label: 'Rideshare' },

  // Food
  beef_kg:        { factor: 27.0,   unit: 'kg',    label: 'Beef' },
  chicken_kg:     { factor: 6.9,    unit: 'kg',    label: 'Chicken' },
  pork_kg:        { factor: 12.1,   unit: 'kg',    label: 'Pork' },
  fish_kg:        { factor: 6.1,    unit: 'kg',    label: 'Fish' },
  dairy_kg:       { factor: 3.2,    unit: 'kg',    label: 'Dairy' },
  vegetables_kg:  { factor: 2.0,    unit: 'kg',    label: 'Vegetables' },
  meal_order:     { factor: 2.3,    unit: 'meal',  label: 'Food delivery' },

  // Energy
  electricity_kwh: { factor: 0.233, unit: 'kWh',   label: 'Electricity (India avg)' },
  natural_gas_m3:  { factor: 2.04,  unit: 'm³',    label: 'Natural gas' },
  lpg_kg:          { factor: 2.98,  unit: 'kg',    label: 'LPG' },

  // Shopping
  clothing_item:  { factor: 10.0,   unit: 'item',  label: 'Clothing item' },
  electronics_item: { factor: 300.0, unit: 'item', label: 'Electronics' },
  paper_kg:       { factor: 1.84,   unit: 'kg',    label: 'Paper' },
  plastic_kg:     { factor: 6.0,    unit: 'kg',    label: 'Plastic goods' },
}

// ─── Static equivalents (per kg CO₂) ─────────────────────────────────────────
export function calculateEquivalents(co2Kg: number): CarbonEquivalent[] {
  const severity = getSeverity(co2Kg)

  const raw = [
    {
      icon: '🌳',
      perKg: 1 / 21.7,           // 1 tree absorbs ~21.7 kg CO₂/year
      unitFn: (v: number) => `${v < 1 ? '<1' : v.toFixed(v < 10 ? 1 : 0)}`,
      unit: 'trees',
      description: 'absorbing carbon for a year',
    },
    {
      icon: '📱',
      perKg: 121.6,              // smartphone charge = 0.00822 kg CO₂
      unitFn: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`,
      unit: 'phone charges',
      description: 'fully charged smartphones',
    },
    {
      icon: '💡',
      perKg: 4.29,               // 1 kWh = 0.233 kg CO₂ → 1 kg = 4.29 kWh
      unitFn: (v: number) => `${v.toFixed(1)}`,
      unit: 'kWh',
      description: 'of household electricity',
    },
    {
      icon: '🏍️',
      perKg: 1 / 0.103,          // petrol bike = 103g/km
      unitFn: (v: number) => `${Math.round(v).toLocaleString()}`,
      unit: 'km',
      description: 'on a petrol motorbike',
    },
    {
      icon: '🚰',
      perKg: 500,                // boiling a kettle = ~0.002 kg CO₂
      unitFn: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`,
      unit: 'kettles',
      description: 'of boiling water',
    },
    {
      icon: '🌊',
      perKg: 1.5,                // approximate ocean acidification proxy
      unitFn: (v: number) => `${v.toFixed(1)}`,
      unit: 'm² ocean',
      description: 'surface acidified this year',
    },
    {
      icon: '🥩',
      perKg: 1 / 27,             // 1 kg beef = 27 kg CO₂
      unitFn: (v: number) => `${v.toFixed(2)}`,
      unit: 'kg beef',
      description: 'equivalent food emissions',
    },
    {
      icon: '⏱️',
      perKg: 0.137,              // ~7.3 kg CO₂ per hour of coal power
      unitFn: (v: number) => `${v.toFixed(1)}`,
      unit: 'hours',
      description: 'of coal power plant operation',
    },
  ]

  return raw.slice(0, 6).map((r) => {
    const value = co2Kg * r.perKg
    return {
      icon: r.icon,
      value,
      formattedValue: r.unitFn(value),
      unit: r.unit,
      description: r.description,
      severity,
    }
  })
}

// ─── Severity classification ──────────────────────────────────────────────────
export function getSeverity(co2Kg: number): 'low' | 'medium' | 'high' | 'critical' {
  if (co2Kg < 2)   return 'low'
  if (co2Kg < 10)  return 'medium'
  if (co2Kg < 50)  return 'high'
  return 'critical'
}

// ─── Earth Avatar health calculation ─────────────────────────────────────────
export function calculateAvatarHealth(weeklyActivities: Activity[]): number {
  const totalCo2 = weeklyActivities.reduce((s, a) => s + a.co2Kg, 0)
  // Average Indian carbon footprint: ~1.9t/year = ~36.5 kg/week
  const baseline = 36.5
  const ratio = totalCo2 / baseline

  if (ratio <= 0.3)  return 95
  if (ratio <= 0.5)  return 85
  if (ratio <= 0.75) return 70
  if (ratio <= 1.0)  return 55
  if (ratio <= 1.5)  return 35
  if (ratio <= 2.0)  return 20
  return 10
}

export function healthToBiome(health: number): string {
  if (health >= 80) return 'thriving'
  if (health >= 60) return 'healthy'
  if (health >= 40) return 'stressed'
  if (health >= 20) return 'degraded'
  return 'critical'
}

// ─── Category → emission factor lookup ────────────────────────────────────────
export const CATEGORY_DEFAULTS: Record<ActivityCategory, { factor: number; unit: string }> = {
  transport:  { factor: 0.171, unit: 'km' },
  flight:     { factor: 0.255, unit: 'km' },
  food:       { factor: 2.3,   unit: 'meal' },
  energy:     { factor: 0.233, unit: 'kWh' },
  shopping:   { factor: 10.0,  unit: 'item' },
  other:      { factor: 1.0,   unit: 'unit' },
}

// ─── Achievement unlock logic ─────────────────────────────────────────────────
export function checkAchievements(
  totalCo2: number,
  activitiesCount: number,
  streak: number,
  challengesWon: number
): string[] {
  const unlocked: string[] = []
  if (activitiesCount >= 1)   unlocked.push('eco_beginner')
  if (totalCo2 <= 100 && activitiesCount >= 10) unlocked.push('carbon_reducer')
  if (streak >= 7)             unlocked.push('streak_7')
  if (streak >= 30)            unlocked.push('streak_30')
  if (challengesWon >= 1)      unlocked.push('challenge_winner')
  if (totalCo2 <= 50 && activitiesCount >= 20) unlocked.push('climate_hero')
  return unlocked
}

// ─── Carbon score (0-1000) ────────────────────────────────────────────────────
export function calculateCarbonScore(weeklyKg: number): number {
  // Lower is better; score inversely proportional to emissions
  const maxWeekly = 100 // kg, very high
  const score = Math.max(0, Math.round((1 - Math.min(weeklyKg, maxWeekly) / maxWeekly) * 1000))
  return score
}
