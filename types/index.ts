// ============================================================
// Core domain types for CarbonMirror AI
// ============================================================

export type ActivityCategory =
  | 'transport'
  | 'food'
  | 'energy'
  | 'shopping'
  | 'flight'
  | 'other'

export interface Activity {
  id: string
  userId: string
  category: ActivityCategory
  label: string
  description?: string
  amount: number
  unit: string
  co2Kg: number
  date: string // ISO
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
}

export interface CarbonEquivalent {
  icon: string
  value: number
  formattedValue: string
  unit: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface RealityCard {
  activityId: string
  co2Kg: number
  equivalents: CarbonEquivalent[]
  story: string
  reductionTip: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// --- User ---
export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  carbonScore: number
  awarenessScore: number
  level: number
  totalCo2Kg: number
  streak: number
  joinedAt: string
  preferences: UserPreferences
  stats: UserStats
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system'
  notifications: boolean
  weeklyReport: boolean
  timezone: string
  country: string
}

export interface UserStats {
  weeklyAvgCo2: number
  monthlyAvgCo2: number
  bestWeekCo2: number
  activitiesLogged: number
  challengesJoined: number
  achievementsUnlocked: number
}

// --- Story ---
export interface CarbonStory {
  id: string
  userId: string
  weekStart: string
  narrative: string
  topCategory: ActivityCategory
  totalCo2Kg: number
  reductionPct: number
  tips: string[]
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'critical'
  generatedAt: string
}

// --- Earth Avatar ---
export type BiomeState = 'thriving' | 'healthy' | 'stressed' | 'degraded' | 'critical'

export interface EarthAvatar {
  userId: string
  health: number // 0-100
  biome: BiomeState
  elements: {
    trees: number
    water: number
    wildlife: number
    pollution: number
    smog: number
  }
  lastUpdated: string
}

// --- Simulation ---
export interface SimulationScenario {
  id: string
  userId: string
  name: string
  timeframe: '1m' | '6m' | '12m'
  currentPath: SimulationPath
  sustainablePath: SimulationPath
  createdAt: string
}

export interface SimulationPath {
  monthlyCo2Kg: number[]
  totalCo2Kg: number
  treesNeeded: number
  moneySaved?: number
  healthScore: number
  label: string
}

// --- Receipt / Scan ---
export interface ScannedReceipt {
  id: string
  userId: string
  imageUrl: string
  type: 'grocery' | 'fuel' | 'electricity' | 'other'
  extractedItems: ReceiptItem[]
  totalCo2Kg: number
  sustainabilityScore: number // 0-100
  suggestions: string[]
  rawText: string
  processedAt: string
}

export interface ReceiptItem {
  name: string
  quantity: number
  unit: string
  co2Kg: number
  category: string
}

// --- Teams & Challenges ---
export interface Team {
  id: string
  name: string
  description: string
  creatorId: string
  memberIds: string[]
  totalCo2Kg: number
  avatarUrl?: string
  createdAt: string
}

export interface Challenge {
  id: string
  teamId?: string
  title: string
  description: string
  type: 'no_car' | 'green_commute' | 'sustainable_food' | 'energy_save' | 'custom'
  targetReductionPct: number
  startDate: string
  endDate: string
  participantIds: string[]
  leaderboard: LeaderboardEntry[]
  status: 'upcoming' | 'active' | 'completed'
  createdBy: string
}

export interface LeaderboardEntry {
  userId: string
  displayName: string
  photoURL?: string
  co2Saved: number
  rank: number
  streak: number
}

// --- Achievements ---
export type AchievementId =
  | 'eco_beginner'
  | 'carbon_reducer'
  | 'climate_hero'
  | 'green_champion'
  | 'planet_guardian'
  | 'streak_7'
  | 'streak_30'
  | 'first_scan'
  | 'challenge_winner'
  | 'team_player'

export interface Achievement {
  id: AchievementId
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
  progress?: number // 0-100 if partial
  requirement: string
}

// --- API responses ---
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// --- Dashboard ---
export interface DashboardData {
  user: UserProfile
  recentActivities: Activity[]
  weeklyStory: CarbonStory | null
  earthAvatar: EarthAvatar
  achievements: Achievement[]
  weeklyTrend: { date: string; co2Kg: number }[]
  categoryBreakdown: { category: ActivityCategory; co2Kg: number; pct: number }[]
}
