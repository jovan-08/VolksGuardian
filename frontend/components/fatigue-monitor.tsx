"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"

interface Alert {
  id: string
  type: "warning" | "critical" | "info"
  message: string
  timestamp: Date
  resolved: boolean
}

export function FatigueMonitor() {
  const [fatigueLevel, setFatigueLevel] = useState(35)
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "warning",
      message: "Fatigue level elevated - Driver has been active for 4 hours",
      timestamp: new Date(),
      resolved: false,
    },
    {
      id: "2",
      type: "info",
      message: "Last break taken 2 hours ago",
      timestamp: new Date(Date.now() - 3600000),
      resolved: false,
    },
  ])

  useEffect(() => {
    // Simulate real-time fatigue data
    const interval = setInterval(() => {
      setFatigueLevel((prev) => {
        const change = (Math.random() - 0.5) * 4
        return Math.max(0, Math.min(100, prev + change))
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getFatigueColor = () => {
    if (fatigueLevel < 30) return "bg-green-500"
    if (fatigueLevel < 60) return "bg-yellow-500"
    if (fatigueLevel < 80) return "bg-orange-500"
    return "bg-red-500"
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  return (
    <div className="grid gap-6">
      {/* Fatigue Level Card */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fatigue Level</CardTitle>
              <CardDescription>Current driver fatigue assessment</CardDescription>
            </div>
            <span className="text-3xl font-bold text-primary">{Math.round(fatigueLevel)}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Fatigue Progress Bar */}
            <div className="space-y-2">
              <div className="h-8 w-full overflow-hidden rounded-lg bg-muted">
                <div
                  className={`h-full transition-all duration-300 ${getFatigueColor()}`}
                  style={{ width: `${fatigueLevel}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">Eyes Open</p>
                <p className="mt-1 text-lg font-semibold">98%</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">Head Position</p>
                <p className="mt-1 text-lg font-semibold">Normal</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">Active Minutes</p>
                <p className="mt-1 text-lg font-semibold">243</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>Recent system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active alerts</p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 ${
                    alert.type === "critical"
                      ? "border-red-500/30 bg-red-500/10"
                      : alert.type === "warning"
                        ? "border-yellow-500/30 bg-yellow-500/10"
                        : "border-blue-500/30 bg-blue-500/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 ${
                        alert.type === "critical"
                          ? "text-red-500"
                          : alert.type === "warning"
                            ? "text-yellow-500"
                            : "text-blue-500"
                      }`}
                    >
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{alert.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Log Break", action: "break" },
              { label: "Dismiss Alert", action: "dismiss" },
              { label: "Request Support", action: "support" },
              { label: "Emergency Stop", action: "stop" },
            ].map((action) => (
              <button
                key={action.action}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
                onClick={() => console.log(`Action: ${action.action}`)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
