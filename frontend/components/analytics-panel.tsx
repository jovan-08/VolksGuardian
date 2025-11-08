"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStore } from "@/lib/store"

export function AnalyticsPanel() {
  const { sessionLog } = useDashboardStore()
  const [chartData, setChartData] = useState<any[]>([])
  const [earVsCnnData, setEarVsCnnData] = useState<any[]>([])
  const [hrTrendData, setHrTrendData] = useState<any[]>([])
  const [alertDistribution, setAlertDistribution] = useState<any[]>([])

  useEffect(() => {
    if (sessionLog.length > 0) {
      // Fatigue trend
      const fatigueTrend = sessionLog
        .slice()
        .reverse()
        .slice(0, 20)
        .map((d, i) => ({
          time: `T-${20 - i * 2}s`,
          fatigue: Math.round(d.fatigue),
        }))
      setChartData(fatigueTrend)

      // EAR vs CNN comparison
      const earVsCnn = sessionLog
        .slice()
        .reverse()
        .slice(0, 15)
        .map((d, i) => ({
          time: `${i * 2}s`,
          ear: Number.parseFloat(d.ear.toFixed(2)),
          cnn: Number.parseFloat(d.cnn.toFixed(2)),
        }))
      setEarVsCnnData(earVsCnn)

      // HR trend
      const hrTrend = sessionLog
        .slice()
        .reverse()
        .slice(0, 20)
        .map((d, i) => ({
          time: `T-${20 - i * 2}s`,
          hr: Math.round(d.hr),
          hrv: Math.round(d.hrv),
        }))
      setHrTrendData(hrTrend)

      // Alert distribution
      const alertCount = sessionLog.filter((d) => d.action === "alert").length
      setAlertDistribution([
        { name: "Normal", value: sessionLog.length - alertCount, color: "hsl(var(--chart-1))" },
        { name: "Alert", value: alertCount, color: "hsl(var(--chart-3))" },
      ])
    }
  }, [sessionLog])

  return (
    <div className="space-y-6">
      {/* Fatigue Trend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Fatigue Trend</CardTitle>
            <CardDescription>Last 20 data points</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fatigueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Area type="monotone" dataKey="fatigue" stroke="hsl(var(--chart-2))" fill="url(#fatigueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* EAR vs CNN */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>EAR vs CNN</CardTitle>
              <CardDescription>Eye aspect ratio vs confidence score</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={earVsCnnData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="ear" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="cnn" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* HR Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Heart Rate Trend</CardTitle>
              <CardDescription>HR and HRV measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={hrTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="hr" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                  <Line type="monotone" dataKey="hrv" stroke="hsl(var(--chart-5))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alert Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Alert Distribution</CardTitle>
            <CardDescription>Session status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={alertDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {alertDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
