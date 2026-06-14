import Link from 'next/link'
import { Globe2 } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🌍</div>
        <h2 className="text-2xl font-bold mb-2">Lost in the atmosphere</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This page doesn&apos;t exist — but your impact still does.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-earth-500 hover:bg-earth-400 text-white text-sm font-medium transition-all"
        >
          <Globe2 className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  )
}
