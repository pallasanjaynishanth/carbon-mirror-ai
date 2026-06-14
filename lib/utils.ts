import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, decimals = 1): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`
  return num.toFixed(decimals)
}

export function formatCo2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`
  return `${kg.toFixed(2)} kg`
}

export const CATEGORY_ICONS: Record<string, string> = {
  transport: '🚗',
  flight: '✈️',
  food: '🍔',
  energy: '⚡',
  shopping: '🛍️',
  other: '📦',
}

export const CATEGORY_LABELS: Record<string, string> = {
  transport: 'Transport',
  flight: 'Flight',
  food: 'Food',
  energy: 'Energy',
  shopping: 'Shopping',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<string, string> = {
  transport: '#fbbf24',
  flight: '#38bdf8',
  food: '#fb923c',
  energy: '#facc15',
  shopping: '#a78bfa',
  other: '#a8a29e',
}
