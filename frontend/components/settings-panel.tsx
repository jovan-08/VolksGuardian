"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

interface Setting {
  id: string
  name: string
  type: "toggle" | "slider" | "select"
  value: any
  min?: number
  max?: number
  options?: string[]
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: "alerts_enabled",
      name: "Enable Alerts",
      type: "toggle",
      value: true,
    },
    {
      id: "fatigue_threshold",
      name: "Fatigue Alert Threshold",
      type: "slider",
      value: 70,
      min: 30,
      max: 100,
    },
    {
      id: "eye_closure_threshold",
      name: "Eye Closure Events Threshold",
      type: "slider",
      value: 10,
      min: 1,
      max: 20,
    },
    {
      id: "break_interval",
      name: "Recommended Break Interval",
      type: "select",
      value: "60",
      options: ["30", "45", "60", "90", "120"],
    },
    {
      id: "camera_enabled",
      name: "Camera Enabled",
      type: "toggle",
      value: true,
    },
    {
      id: "data_logging",
      name: "Enable Data Logging",
      type: "toggle",
      value: true,
    },
  ])

  const [expandedSection, setExpandedSection] = useState<string | null>("monitoring")

  const handleSettingChange = (id: string, value: any) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, value } : s)))
  }

  const sections = [
    {
      id: "monitoring",
      title: "Monitoring Settings",
      settings: settings.filter((s) => ["alerts_enabled", "fatigue_threshold", "eye_closure_threshold"].includes(s.id)),
    },
    {
      id: "behavior",
      title: "Behavior Settings",
      settings: settings.filter((s) => ["break_interval"].includes(s.id)),
    },
    {
      id: "hardware",
      title: "Hardware Settings",
      settings: settings.filter((s) => ["camera_enabled", "data_logging"].includes(s.id)),
    },
  ]

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Card key={section.id} className="border-border bg-card">
          <button
            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            className="w-full"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 hover:bg-muted/50">
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${expandedSection === section.id ? "rotate-180" : ""}`}
              />
            </CardHeader>
          </button>

          {expandedSection === section.id && (
            <CardContent className="space-y-6 border-t border-border pt-6">
              {section.settings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">{setting.name}</label>
                    {setting.type === "toggle" && (
                      <button
                        onClick={() => handleSettingChange(setting.id, !setting.value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.value ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            setting.value ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {setting.type === "slider" && (
                    <div className="space-y-2">
                      <input
                        type="range"
                        min={setting.min}
                        max={setting.max}
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, Number.parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{setting.min}</span>
                        <span className="font-semibold text-foreground">{setting.value}</span>
                        <span>{setting.max}</span>
                      </div>
                    </div>
                  )}

                  {setting.type === "select" && (
                    <select
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground"
                    >
                      {setting.options?.map((option) => (
                        <option key={option} value={option} className="bg-card text-foreground">
                          {option} minutes
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}

      {/* System Information */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Current system status and versions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Dashboard Version", value: "2.1.0" },
              { label: "API Version", value: "1.4.2" },
              { label: "Last Updated", value: "Nov 8, 2025" },
              { label: "System Status", value: "Healthy" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between border-t border-border pt-3 first:border-0 first:pt-0"
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Save Settings
        </button>
        <button className="rounded-lg border border-border px-4 py-2 font-medium transition-colors hover:bg-muted">
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
