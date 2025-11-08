"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useDashboardStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function SettingsConfig() {
  const { settings, updateSettings } = useDashboardStore()

  return (
    <div className="space-y-6">
      {/* Monitoring Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Monitoring Settings</CardTitle>
            <CardDescription>Configure alert thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fatigue Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Fatigue Alert Threshold</Label>
                <span className="text-lg font-semibold text-primary">{settings.fatigueThreshold}%</span>
              </div>
              <Slider
                value={[settings.fatigueThreshold]}
                onValueChange={(value) => updateSettings({ fatigueThreshold: value[0] })}
                min={30}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Alert when fatigue exceeds this threshold</p>
            </div>

            {/* PERCLOS Threshold */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">PERCLOS Alert Threshold</Label>
                <span className="text-lg font-semibold text-primary">
                  {(settings.perclosThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[settings.perclosThreshold * 100]}
                onValueChange={(value) => updateSettings({ perclosThreshold: value[0] / 100 })}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Alert when eye closure percentage exceeds this threshold</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alert Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Alert Preferences</CardTitle>
            <CardDescription>Choose alert notification methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="audio-alerts" className="text-base font-medium cursor-pointer">
                Audio Alerts
              </Label>
              <Switch
                id="audio-alerts"
                checked={settings.audioAlerts}
                onCheckedChange={(checked) => updateSettings({ audioAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="llm-alerts" className="text-base font-medium cursor-pointer">
                LLM-based Alerts
              </Label>
              <Switch
                id="llm-alerts"
                checked={settings.llmAlerts}
                onCheckedChange={(checked) => updateSettings({ llmAlerts: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button className="bg-primary hover:bg-primary/90">Save Settings</Button>
        <Button variant="outline">Reset to Defaults</Button>
      </div>
    </div>
  )
}
