'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Leaf, Zap, Globe2, BarChart3, Users, Camera } from 'lucide-react'
import { useRef } from 'react'

const features = [
  {
    icon: Globe2,
    title: 'Earth Avatar',
    desc: 'Watch a living digital ecosystem react to your choices in real time.',
    color: 'text-earth-400',
    bg: 'bg-earth-400/10',
  },
  {
    icon: Zap,
    title: 'Carbon Reality Engine',
    desc: '280kg CO₂ becomes "14 trees absorbing carbon for a year." Numbers become stories.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: BarChart3,
    title: 'Future Simulator',
    desc: 'Compare your current path against a sustainable one — 1, 6, and 12 months out.',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    icon: Camera,
    title: 'Receipt Scanner',
    desc: 'Upload grocery bills and fuel receipts. AI extracts emissions and scores your choices.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Users,
    title: 'Community Challenges',
    desc: 'Compete in No Car Week, Sustainable Food Month, and more with real teams.',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
  {
    icon: Leaf,
    title: 'AI Storyteller',
    desc: 'Gemini generates personalized narratives that make your impact feel real.',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
  },
]

const stats = [
  { value: '4.8T', label: 'tonnes CO₂ we help contextualize' },
  { value: '23x', label: 'more behavior change vs. trackers' },
  { value: '50+', label: 'contextual impact comparisons' },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-smoke-950 text-smoke-50 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-smoke-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-earth-500 flex items-center justify-center">
              <Globe2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight">CarbonMirror</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-smoke-400">
            <Link href="#features" className="hover:text-smoke-100 transition-colors">Features</Link>
            <Link href="#how" className="hover:text-smoke-100 transition-colors">How it works</Link>
            <Link href="#community" className="hover:text-smoke-100 transition-colors">Community</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm text-smoke-400 hover:text-smoke-100 transition-colors">
              Sign in
            </Link>
            <Link
              href="/auth?mode=signup"
              className="text-sm px-4 py-2 rounded-lg bg-earth-500 text-white hover:bg-earth-400 transition-colors font-medium"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background atmosphere */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-earth-900/30 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-earth-800/20 blur-[80px]" />
          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-earth-400/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <motion.div
          style={{ y, opacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-earth-500/30 text-earth-400 text-xs font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-earth-400 animate-pulse" />
            Powered by Gemini AI × PromptWars Challenge 3
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
          >
            See the hidden
            <br />
            <span className="gradient-text">impact</span> of your
            <br />
            everyday choices.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-smoke-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Not a carbon calculator. A behavioral change engine that turns abstract emissions into
            visceral stories, living ecosystems, and social accountability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth?mode=signup"
              className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-earth-500 hover:bg-earth-400 text-white font-semibold transition-all shadow-glow hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
            >
              See your mirror
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass border border-smoke-700 text-smoke-300 hover:text-smoke-100 hover:border-smoke-600 transition-all font-medium"
            >
              Watch it work
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{s.value}</div>
                <div className="text-xs text-smoke-500">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border border-smoke-700 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-smoke-500" />
          </div>
        </motion.div>
      </section>

      {/* Carbon Reality demo strip */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 md:p-12 border border-smoke-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-earth-900/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="text-xs text-smoke-500 uppercase tracking-widest mb-4">Carbon Reality Engine</div>
              <div className="text-2xl md:text-3xl font-semibold mb-8">
                Your flight from Mumbai to London
                <span className="text-smoke-500"> (1 trip)</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '🌳', value: '14', unit: 'trees', desc: 'absorbing for a year' },
                  { icon: '📱', value: '34,000', unit: 'phones', desc: 'fully charged' },
                  { icon: '🏠', value: '3', unit: 'months', desc: 'household electricity' },
                  { icon: '🏍️', value: '1,100', unit: 'km', desc: 'on a petrol bike' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-smoke-900/60 rounded-xl p-4 border border-smoke-800"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-2xl font-bold text-smoke-100">{item.value}</div>
                    <div className="text-sm text-earth-400 font-medium">{item.unit}</div>
                    <div className="text-xs text-smoke-500 mt-1">{item.desc}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-smoke-800 text-sm text-smoke-400">
                <span className="text-amber-400 font-medium">280 kg CO₂</span> — transformed into context you can actually feel.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="text-xs text-smoke-500 uppercase tracking-widest mb-4">The system</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Built to change behavior,
              <br />
              <span className="gradient-text">not just measure it.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-6 border border-smoke-800 card-hover group"
              >
                <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-smoke-100 mb-2">{f.title}</h3>
                <p className="text-sm text-smoke-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earth Avatar teaser */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-xs text-smoke-500 uppercase tracking-widest mb-4">Earth Avatar</div>
              <h2 className="text-4xl font-bold tracking-tight mb-6">
                Your planet reflects
                <br />
                your choices.
              </h2>
              <p className="text-smoke-400 leading-relaxed mb-8">
                A living digital ecosystem that thrives when you make sustainable choices and
                degrades when you don&apos;t. Green forests and flowing rivers — or smog,
                drought, and dead trees. The feedback is immediate and visceral.
              </p>
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center gap-2 text-earth-400 hover:text-earth-300 transition-colors font-medium text-sm"
              >
                See your avatar <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Avatar preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl biome-healthy relative overflow-hidden border border-earth-800/50 shadow-deep">
                {/* Animated ecosystem elements */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1/3"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="absolute bottom-4 left-8 text-4xl">🌲</div>
                  <div className="absolute bottom-2 left-20 text-5xl">🌳</div>
                  <div className="absolute bottom-6 right-12 text-3xl">🌲</div>
                  <div className="absolute bottom-2 right-4 text-4xl">🌿</div>
                </motion.div>
                <motion.div
                  className="absolute top-8 right-8 text-2xl"
                  animate={{ x: [-10, 10, -10], y: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  🦋
                </motion.div>
                <motion.div
                  className="absolute top-16 left-12 text-xl"
                  animate={{ x: [0, 15, 0], y: [-3, 3, -3] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                >
                  🐦
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-3">🌍</div>
                    <div className="text-earth-300 text-sm font-medium">Health: 87%</div>
                    <div className="text-earth-400/60 text-xs">Thriving ecosystem</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Your mirror is ready.
              <br />
              <span className="gradient-text">Are you?</span>
            </h2>
            <p className="text-smoke-400 mb-10 text-lg">
              Join thousands making choices with full awareness of their planetary cost.
            </p>
            <Link
              href="/auth?mode=signup"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-earth-500 hover:bg-earth-400 text-white font-semibold text-lg transition-all shadow-glow hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]"
            >
              Start for free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="mt-4 text-xs text-smoke-600">No credit card. No commitment.</div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-smoke-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-smoke-600 text-sm">
            <Globe2 className="w-4 h-4 text-earth-600" />
            <span>CarbonMirror AI — PromptWars Challenge 3</span>
          </div>
          <div className="text-xs text-smoke-700">
            Built with Next.js 15 · Gemini AI · Firebase · Framer Motion
          </div>
        </div>
      </footer>
    </div>
  )
}
