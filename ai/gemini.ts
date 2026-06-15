import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import type { Activity, ActivityCategory, CarbonStory, SimulationScenario } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_API_KEY)

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

function getModel(vision = false) {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    safetySettings,
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  })
}

// ─── 1. Carbon Awareness Story ───────────────────────────────────────────────
export async function generateCarbonStory(
  activities: Activity[],
  userId: string
): Promise<Omit<CarbonStory, 'id' | 'generatedAt'>> {
  const model = getModel()
  const totalCo2 = activities.reduce((sum, a) => sum + a.co2Kg, 0)

  const grouped = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + a.co2Kg
    return acc
  }, {})

  const topCategory = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0]?.[0] as ActivityCategory

  const prompt = `You are an empathetic environmental storyteller for CarbonMirror AI.

A user logged these activities this week:
${activities.map(a => `- ${a.label}: ${a.co2Kg.toFixed(1)}kg CO₂ (${a.category})`).join('\n')}
Total: ${totalCo2.toFixed(1)}kg CO₂

Write a personalized, emotionally resonant carbon story. Be specific, human, and slightly urgent — but not preachy.

Return ONLY valid JSON with this exact shape:
{
  "narrative": "2-3 paragraph story (150-200 words). Make it vivid and personal.",
  "reductionPct": <number 0-40 achievable reduction percentage>,
  "tips": ["specific tip 1", "specific tip 2", "specific tip 3"],
  "mood": "<excellent|good|neutral|poor|critical based on total CO₂>"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text().replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(text)

  return {
    userId,
    weekStart: new Date().toISOString(),
    narrative: parsed.narrative,
    topCategory,
    totalCo2Kg: totalCo2,
    reductionPct: parsed.reductionPct,
    tips: parsed.tips,
    mood: parsed.mood,
  }
}

// ─── 2. Reality Equivalents ───────────────────────────────────────────────────
export async function generateRealityEquivalents(co2Kg: number, label: string) {
  const model = getModel()

  const prompt = `You are the Carbon Reality Engine for CarbonMirror AI.

Activity: "${label}" emitted ${co2Kg.toFixed(2)} kg CO₂.

Convert this into 6 vivid, emotionally impactful human-scale equivalents.
Mix categories: nature, technology, travel, home, food, time.

Return ONLY valid JSON array:
[
  {
    "icon": "<single emoji>",
    "value": <number>,
    "formattedValue": "<formatted string like '34,000' or '3.2'>",
    "unit": "<short unit label>",
    "description": "<what this means, 5-8 words>",
    "severity": "<low|medium|high|critical>"
  }
]

Make the equivalents surprising and visceral. Avoid generic comparisons.`

  const result = await model.generateContent(prompt)
  const text = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

// ─── 3. Future Simulation ─────────────────────────────────────────────────────
export async function generateSimulation(
  activities: Activity[],
  timeframe: '1m' | '6m' | '12m'
): Promise<{ current: number[]; sustainable: number[]; insights: string[] }> {
  const model = getModel()
  const months = timeframe === '1m' ? 1 : timeframe === '6m' ? 6 : 12
  const avgMonthly = activities.reduce((s, a) => s + a.co2Kg, 0) / Math.max(1, activities.length) * 30

  const prompt = `You are a sustainability simulation engine.

User's current monthly carbon footprint: ${avgMonthly.toFixed(1)} kg CO₂
Activity breakdown: ${JSON.stringify(activities.slice(0, 10).map(a => ({ label: a.label, co2Kg: a.co2Kg, category: a.category })))}
Simulation timeframe: ${months} month(s)

Generate a realistic month-by-month simulation for ${months} months.

Return ONLY valid JSON:
{
  "current": [<monthly CO₂ kg values, slight random variation>],
  "sustainable": [<monthly CO₂ kg values if user makes smart changes, gradual improvement>],
  "insights": ["insight 1", "insight 2", "insight 3"]
}

Array lengths must be exactly ${months}.
Sustainable path should show 20-40% reduction over time.`

  const result = await model.generateContent(prompt)
  const text = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

// ─── 4. Receipt/Bill Analysis ─────────────────────────────────────────────────
export async function analyzeReceiptWithVision(
  imageBase64: string,
  mimeType: string
): Promise<{
  items: Array<{ name: string; quantity: number; unit: string; co2Kg: number; category: string }>
  totalCo2Kg: number
  sustainabilityScore: number
  suggestions: string[]
  receiptType: string
  rawSummary: string
}> {
  const model = getModel(true)

  const prompt = `You are a sustainability analyst with the Carbon Mirror AI scanner.

Analyze this receipt/bill image and:
1. Identify all items/services
2. Estimate CO₂ emissions for each item
3. Calculate total emissions
4. Score sustainability (0-100)
5. Suggest improvements

Return ONLY valid JSON:
{
  "receiptType": "<grocery|fuel|electricity|restaurant|other>",
  "rawSummary": "<1-2 sentence summary of what you see>",
  "items": [
    {
      "name": "<item name>",
      "quantity": <number>,
      "unit": "<unit>",
      "co2Kg": <estimated CO₂ in kg>,
      "category": "<food|transport|energy|goods>"
    }
  ],
  "totalCo2Kg": <total CO₂>,
  "sustainabilityScore": <0-100>,
  "suggestions": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3"]
}`

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: imageBase64 } },
  ])

  const text = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

// ─── 5. Weekly Report ─────────────────────────────────────────────────────────
export async function generateWeeklyReport(
  userId: string,
  activities: Activity[],
  previousWeekCo2: number
) {
  const model = getModel()
  const totalCo2 = activities.reduce((s, a) => s + a.co2Kg, 0)
  const changePct = previousWeekCo2 > 0
    ? ((totalCo2 - previousWeekCo2) / previousWeekCo2) * 100
    : 0

  const prompt = `Generate a concise weekly carbon report for CarbonMirror AI.

This week: ${totalCo2.toFixed(1)}kg CO₂
Previous week: ${previousWeekCo2.toFixed(1)}kg CO₂
Change: ${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%

Activities: ${activities.map(a => `${a.label} (${a.co2Kg.toFixed(1)}kg)`).join(', ')}

Return ONLY valid JSON:
{
  "headline": "<punchy 1-sentence summary>",
  "body": "<2 paragraph report, 100-150 words>",
  "highlight": "<single most important insight>",
  "nextWeekGoal": "<specific, achievable goal for next week>",
  "badge": "<badge name if earned, else null>"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

// ─── 6. Behavior Analysis ─────────────────────────────────────────────────────
export async function analyzeBehaviorPatterns(activities: Activity[]) {
  const model = getModel()

  const prompt = `You are a behavioral psychologist specializing in sustainability habits.

Analyze these user activities and identify behavioral patterns:
${JSON.stringify(activities.map(a => ({ category: a.category, label: a.label, co2Kg: a.co2Kg, date: a.date })))}

Return ONLY valid JSON:
{
  "patterns": [
    {
      "title": "<pattern name>",
      "description": "<what you observe>",
      "impact": "<low|medium|high>",
      "suggestion": "<actionable change>"
    }
  ],
  "primaryHabit": "<the single most carbon-intensive habit>",
  "quickWin": "<easiest change with biggest impact>",
  "motivationalMessage": "<personalized 1-sentence encouragement>"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}
