'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useAuth } from '@/components/layout/AuthProvider'
import { Upload, Camera, Loader2, CheckCircle2, AlertCircle, FileText, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScanResult {
  receiptType: string
  rawSummary: string
  items: Array<{ name: string; quantity: number; unit: string; co2Kg: number; category: string }>
  totalCo2Kg: number
  sustainabilityScore: number
  suggestions: string[]
}

const scoreConfig = (score: number) => {
  if (score >= 80) return { label: 'Excellent', color: 'text-earth-400', bg: 'bg-earth-400/10', emoji: '🌿' }
  if (score >= 60) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-400/10', emoji: '🍃' }
  if (score >= 40) return { label: 'Average', color: 'text-amber-400', bg: 'bg-amber-400/10', emoji: '⚠️' }
  return { label: 'Poor', color: 'text-red-400', bg: 'bg-red-400/10', emoji: '🔴' }
}

export default function ScannerPage() {
  const { user } = useAuth()
  const [dragging, setDragging] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WEBP)')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setScanning(true)
    setResult(null)

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve((r.result as string).split(',')[1])
        r.onerror = reject
        r.readAsDataURL(file)
      })

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
          userId: user?.uid,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setResult(data.result)
        // Save to Firestore
        if (user) {
          await addDoc(collection(db, 'receipts'), {
            userId: user.uid,
            type: data.result.receiptType,
            extractedItems: data.result.items,
            totalCo2Kg: data.result.totalCo2Kg,
            sustainabilityScore: data.result.sustainabilityScore,
            suggestions: data.result.suggestions,
            rawText: data.result.rawSummary,
            processedAt: serverTimestamp(),
          })
        }
        toast.success('Receipt analyzed!')
      } else {
        toast.error('Could not analyze receipt. Try a clearer image.')
      }
    } catch {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const score = result ? scoreConfig(result.sustainabilityScore) : null

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Receipt Scanner</h1>
        <p className="text-muted-foreground text-sm">
          Upload grocery bills, fuel receipts, or electricity bills. AI extracts your carbon footprint.
        </p>
      </div>

      {/* Upload area */}
      {!result && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            dragging
              ? 'border-earth-400 bg-earth-400/5'
              : 'border-border hover:border-earth-500/50 hover:bg-secondary/30'
          } ${scanning ? 'pointer-events-none' : ''}`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {preview ? (
            <div className="relative">
              <img src={preview} alt="Receipt preview" className="w-full rounded-xl object-contain max-h-72" />
              {scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                  <Loader2 className="w-10 h-10 text-earth-400 animate-spin mb-3" />
                  <div className="text-sm font-medium">Analyzing with Gemini Vision...</div>
                  <div className="text-xs text-muted-foreground mt-1">Extracting items and calculating emissions</div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-earth-500/10 border border-earth-500/20 flex items-center justify-center mb-4">
                <Upload className="w-7 h-7 text-earth-400" />
              </div>
              <div className="text-base font-semibold mb-1">Drop your receipt here</div>
              <div className="text-sm text-muted-foreground mb-4">
                or click to browse · JPG, PNG, WEBP supported
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><FileText className="w-3 h-3" /> Grocery bills</div>
                <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> Electricity bills</div>
                <div className="flex items-center gap-1"><Camera className="w-3 h-3" /> Fuel receipts</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && score && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Score header */}
            <div className={`${score.bg} rounded-2xl border border-white/10 p-6 flex items-start gap-4`}>
              {preview && (
                <img src={preview} alt="" className="w-16 h-20 object-cover rounded-lg border border-white/10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-1 capitalize">{result.receiptType} receipt</div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{score.emoji}</span>
                  <div>
                    <div className={`text-xl font-bold ${score.color}`}>{score.label}</div>
                    <div className="text-sm text-muted-foreground">Sustainability Score</div>
                  </div>
                  <div className={`ml-auto text-3xl font-bold ${score.color}`}>{result.sustainabilityScore}/100</div>
                </div>
                <p className="text-sm text-muted-foreground">{result.rawSummary}</p>
              </div>
            </div>

            {/* Total emissions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="text-xs text-muted-foreground mb-1">Total Carbon Footprint</div>
                <div className="text-2xl font-bold">{result.totalCo2Kg.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">kg CO₂</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="text-xs text-muted-foreground mb-1">Items Analyzed</div>
                <div className="text-2xl font-bold">{result.items.length}</div>
                <div className="text-sm text-muted-foreground">products / services</div>
              </div>
            </div>

            {/* Item breakdown */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="text-sm font-semibold mb-4">Item Breakdown</div>
              <div className="space-y-2">
                {result.items.sort((a, b) => b.co2Kg - a.co2Kg).map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.category} · {item.quantity} {item.unit}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-semibold ${item.co2Kg > 5 ? 'text-red-400' : item.co2Kg > 1 ? 'text-amber-400' : 'text-earth-400'}`}>
                        {item.co2Kg.toFixed(2)} kg
                      </div>
                    </div>
                    <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.co2Kg > 5 ? 'bg-red-400' : item.co2Kg > 1 ? 'bg-amber-400' : 'bg-earth-400'}`}
                        style={{ width: `${Math.min(100, (item.co2Kg / result.totalCo2Kg) * 100)}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-earth-500/5 border border-earth-500/20 rounded-xl p-5">
              <div className="text-sm font-semibold mb-3 text-earth-400">How to improve</div>
              <div className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-earth-400 mt-0.5 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Scan another */}
            <button
              onClick={() => { setResult(null); setPreview(null) }}
              className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-all"
            >
              Scan another receipt
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
