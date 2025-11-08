"use client"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const fatigueTimeline = [
  { time: "00:00", level: 15 },
  { time: "02:00", level: 22 },
  { time: "04:00", level: 35 },
  { time: "06:00", level: 48 },
  { time: "08:00", level: 62 },
  { time: "10:00", level: 71 },
  { time: "12:00", level: 58 },
  { time: "14:00", level: 42 },
]

const eyeClosureData = [
  { time: "00:00", events: 2 },
  { time: "02:00", events: 3 },
  { time: "04:00", events: 5 },
  { time: "06:00", events: 8 },
  { time: "08:00", events: 12 },
  { time: "10:00", events: 15 },
  { time: "12:00", events: 11 },
  { time: "14:00", events: 6 },
]

const sessionStats = [
  { name: "Safe", value: 72, color: "oklch(0.65 0.2 162.5)" },
  { name: "Caution", value: 20, color: "oklch(0.68 0.21 251.1)" },
  { name: "Alert", value: 8, color: "oklch(0.62 0.19 10.4)" },
]

const hourlyBreakdown = [
  { hour: "00-02h", safe: 95, caution: 5, alert: 0 },
  { hour: "02-04h", safe: 88, caution: 10, alert: 2 },
  { hour: "04-06h", safe: 75, caution: 18, alert: 7 },
  { hour: "06-08h", safe: 62, caution: 28, alert: 10 },
  { hour: "08-10h", safe: 48, caution: 38, alert: 14 },
  { hour: "10-12h", safe: 65, caution: 25, alert: 10 },
]

export function ChartsDashboard() {
  return (
    <div className="grid gap-6">
      {/* Fatigue Trend Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Fatigue Trend</CardTitle>
          <CardDescription>Last 14 hours of fatigue assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fatigueTimeline}>
              <defs>
                <linearGradient id="fatigueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.6 0.21 262.4)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="oklch(0.6 0.21 262.4)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
              <XAxis dataKey="time" stroke="oklch(0.7 0 0)" />
              <YAxis stroke="oklch(0.7 0 0)" />
              <Tooltip
                contentStyle={{ backgroundColor: "oklch(0.125 0 0)", border: "1px solid oklch(0.2 0 0)" }}
                labelStyle={{ color: "oklch(0.98 0 0)" }}
              />
              <Area type="monotone" dataKey="level" stroke="oklch(0.6 0.21 262.4)" fill="url(#fatigueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Eye Closure Events */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Eye Closure Events</CardTitle>
            <CardDescription>Detected eye closures per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={eyeClosureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
                <XAxis dataKey="time" stroke="oklch(0.7 0 0)" />
                <YAxis stroke="oklch(0.7 0 0)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "oklch(0.125 0 0)", border: "1px solid oklch(0.2 0 0)" }}
                  labelStyle={{ color: "oklch(0.98 0 0)" }}
                />
                <Bar dataKey="events" fill="oklch(0.68 0.21 251.1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Status Breakdown */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>Distribution of fatigue levels</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sessionStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sessionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "oklch(0.125 0 0)", border: "1px solid oklch(0.2 0 0)" }}
                  labelStyle={{ color: "oklch(0.98 0 0)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Breakdown */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Hourly Breakdown</CardTitle>
          <CardDescription>Fatigue status distribution by time period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
              <XAxis dataKey="hour" stroke="oklch(0.7 0 0)" />
              <YAxis stroke="oklch(0.7 0 0)" />
              <Tooltip
                contentStyle={{ backgroundColor: "oklch(0.125 0 0)", border: "1px solid oklch(0.2 0 0)" }}
                labelStyle={{ color: "oklch(0.98 0 0)" }}
              />
              <Legend />
              <Bar dataKey="safe" stackId="a" fill="oklch(0.65 0.2 162.5)" />
              <Bar dataKey="caution" stackId="a" fill="oklch(0.68 0.21 251.1)" />
              <Bar dataKey="alert" stackId="a" fill="oklch(0.62 0.19 10.4)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Avg Fatigue", value: "48%", trend: "+5%" },
          { label: "Total Events", value: "56", trend: "+12" },
          { label: "Safe Time", value: "72%", trend: "-8%" },
          { label: "Breaks Taken", value: "3", trend: "0" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
