'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/layout/AuthProvider'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'
import { Bell, Globe, Moon, Sun, Monitor, Mail, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { profile, user, refreshProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.displayName || '')
  const [notifications, setNotifications] = useState(profile?.preferences?.notifications ?? true)
  const [weeklyReport, setWeeklyReport] = useState(profile?.preferences?.weeklyReport ?? true)

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        'preferences.notifications': notifications,
        'preferences.weeklyReport': weeklyReport,
      })
      await refreshProfile()
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Profile</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Display name</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {user?.email}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Appearance</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ].map(t => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                  theme === t.value ? 'border-earth-500/50 bg-earth-500/10' : 'border-border hover:bg-secondary/50'
                }`}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Notifications</h3>
          <div className="space-y-3">
            <ToggleRow
              icon={Bell}
              label="Push notifications"
              description="Get reminders to log your daily activities"
              checked={notifications}
              onChange={setNotifications}
            />
            <ToggleRow
              icon={Mail}
              label="Weekly AI report"
              description="Receive your personalized carbon story every week"
              checked={weeklyReport}
              onChange={setWeeklyReport}
            />
          </div>
        </motion.div>

        {/* Region */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Region</h3>
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">India</div>
              <div className="text-xs text-muted-foreground">Emission factors calibrated for Asia/Kolkata grid mix</div>
            </div>
          </div>
        </motion.div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-earth-500 hover:bg-earth-400 text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-glow-sm"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  )
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }: {
  icon: typeof Bell
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-earth-500' : 'bg-secondary'}`}
      >
        <motion.div
          className="w-4 h-4 rounded-full bg-white absolute top-1"
          animate={{ left: checked ? '22px' : '4px' }}
          transition={{ duration: 0.2 }}
        />
      </button>
    </div>
  )
}
