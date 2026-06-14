'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Globe2, Zap, TrendingUp, Camera, Users, Trophy, LogOut,
  ChevronRight, Settings, Moon, Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from './AuthProvider'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/avatar',       icon: Globe2,           label: 'Earth Avatar' },
  { href: '/reality',      icon: Zap,              label: 'Log Activity' },
  { href: '/simulator',    icon: TrendingUp,       label: 'Future Simulator' },
  { href: '/scanner',      icon: Camera,           label: 'Receipt Scanner' },
  { href: '/challenges',   icon: Users,            label: 'Challenges' },
  { href: '/achievements', icon: Trophy,           label: 'Achievements' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { profile, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col border-r border-border bg-card/50 backdrop-blur-xl z-40">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-earth-500 flex items-center justify-center shadow-glow-sm">
            <Globe2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">CarbonMirror</div>
            <div className="text-[10px] text-muted-foreground">AI Awareness Engine</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                active
                  ? 'bg-earth-500/10 text-earth-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-earth-400 rounded-full"
                />
              )}
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-earth-400' : 'text-muted-foreground group-hover:text-foreground')} />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto text-earth-400/60" />}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border space-y-1">
        {/* Carbon score mini */}
        {profile && (
          <div className="px-3 py-2 rounded-lg bg-earth-500/5 border border-earth-500/20 mb-2">
            <div className="text-xs text-muted-foreground mb-1">Carbon Score</div>
            <div className="text-xl font-bold gradient-text">{profile.carbonScore}</div>
            <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-earth-500"
                initial={{ width: 0 }}
                animate={{ width: `${(profile.carbonScore / 1000) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>

        {/* User avatar */}
        {profile && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-earth-700 flex items-center justify-center text-xs font-semibold text-earth-200">
              {profile.displayName?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{profile.displayName}</div>
              <div className="text-[10px] text-muted-foreground truncate">{profile.email}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
