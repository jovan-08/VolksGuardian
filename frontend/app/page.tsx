"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { WellnessMonitor } from "@/components/wellness-monitor"
import { AnalyticsPanel } from "@/components/analytics-panel"
import { SessionLog } from "@/components/session-log"
import { SettingsConfig } from "@/components/settings-config"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"monitoring" | "analytics" | "session" | "settings">("monitoring")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs = [
    { id: "monitoring", label: "Monitoring", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "session", label: "Session Log", icon: "📋" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Driver Fatigue Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Real-time wellness monitoring system</p>
          </motion.div>

          {/* Mobile Menu */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className="p-2 hover:bg-muted rounded-lg">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-48 bg-sidebar border-border">
              <nav className="space-y-2 mt-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any)
                      setSidebarOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar/80 text-sidebar-foreground"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          className="hidden lg:block w-48 border-r border-border bg-sidebar/50 backdrop-blur-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <nav className="space-y-1 p-4 sticky top-16">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg"
                    : "text-sidebar-foreground hover:bg-sidebar/80"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8 overflow-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "monitoring" && <WellnessMonitor />}
            {activeTab === "analytics" && <AnalyticsPanel />}
            {activeTab === "session" && <SessionLog />}
            {activeTab === "settings" && <SettingsConfig />}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
