"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, Heart, Eye, Zap } from "lucide-react"
import { useDashboardStore } from "@/lib/store"
import { generateMockWellnessData } from "@/lib/mock-data"

export function WellnessMonitor() {
  const { currentData, settings, setCurrentData, addToSessionLog } = useDashboardStore()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    setIsConnected(true)

    // Simulate WebSocket polling
    const interval = setInterval(() => {
      const data = generateMockWellnessData()
      setCurrentData(data)
      addToSessionLog(data)
    }, 2000)

    return () => clearInterval(interval)
  }, [setCurrentData, addToSessionLog])

  if (!currentData) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading wellness data...</p>
        </CardContent>
      </Card>
    )
  }

  const fatigueLevel = Math.round(currentData.fatigue)
  const getFatigueColor = () => {
    if (fatigueLevel < 30) return "from-green-500 to-emerald-600"
    if (fatigueLevel < 60) return "from-yellow-500 to-orange-600"
    if (fatigueLevel < 80) return "from-orange-500 to-red-600"
    return "from-red-500 to-red-700"
  }

  const isCritical = fatigueLevel >= settings.fatigueThreshold || currentData.perclos_30s >= settings.perclosThreshold

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
        <motion.div
          animate={{ scale: isConnected ? 1 : 0.8 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
        />
        <span className="text-sm text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
      </motion.div>

      {/* Fatigue Gauge */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fatigue Assessment</CardTitle>
                <CardDescription>Real-time driver wellness monitoring</CardDescription>
              </div>
              {isCritical && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                >
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </motion.div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fatigue Ring */}
            <div className="flex items-center justify-center">
              <div className="relative h-48 w-48">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                    className={`text-transparent bg-gradient-to-r ${getFatigueColor()}`}
                    style={{
                      stroke: `url(#gradient)`,
                      strokeDasharray: `${(fatigueLevel / 100) * 282.7} 282.7`,
                    }}
                    animate={{
                      strokeDasharray: [`${(fatigueLevel / 100) * 282.7} 282.7`],
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%">
                      <stop offset="0%" stopColor="rgb(34, 197, 94)" />
                      <stop offset="100%" stopColor="rgb(239, 68, 68)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    className="text-center"
                  >
                    <div className="text-4xl font-bold">{fatigueLevel}%</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {fatigueLevel < 30 ? "Alert" : fatigueLevel < 60 ? "Caution" : "Critical"}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Eye Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <p className="text-xs text-muted-foreground">EAR</p>
                  </div>
                  <p className="text-lg font-semibold">{currentData.ear.toFixed(2)}</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <div className="rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    <p className="text-xs text-muted-foreground">Blink/min</p>
                  </div>
                  <p className="text-lg font-semibold">{currentData.blink_per_min.toFixed(1)}</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-purple-400" />
                    <p className="text-xs text-muted-foreground">PERCLOS</p>
                  </div>
                  <p className="text-lg font-semibold">{currentData.perclos_30s.toFixed(2)}</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <div className="rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <p className="text-xs text-muted-foreground">HR</p>
                  </div>
                  <p className="text-lg font-semibold">{Math.round(currentData.hr)}</p>
                </div>
              </motion.div>
            </div>

            {/* Alert Status */}
            {isCritical && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-300">Critical Alert</p>
                    <p className="text-sm text-red-200 mt-1">
                      Driver fatigue level is critical. Recommend immediate rest break.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
