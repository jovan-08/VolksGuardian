"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDashboardStore } from "@/lib/store"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function SessionLog() {
  const { sessionLog } = useDashboardStore()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Session Log</CardTitle>
          <CardDescription>Real-time data entries synced from backend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Time</TableHead>
                  <TableHead className="text-muted-foreground">EAR</TableHead>
                  <TableHead className="text-muted-foreground">Blink/min</TableHead>
                  <TableHead className="text-muted-foreground">PERCLOS</TableHead>
                  <TableHead className="text-muted-foreground">CNN</TableHead>
                  <TableHead className="text-muted-foreground">Fatigue</TableHead>
                  <TableHead className="text-muted-foreground">HR</TableHead>
                  <TableHead className="text-muted-foreground">HRV</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionLog.slice(0, 20).map((entry, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-border hover:bg-muted/50"
                  >
                    <TableCell className="text-sm text-foreground">{entry.time}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.ear.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.blink_per_min.toFixed(1)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.perclos_30s.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.cnn.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{Math.round(entry.fatigue)}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{Math.round(entry.hr)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{Math.round(entry.hrv)}</TableCell>
                    <TableCell>
                      {entry.action === "alert" ? (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <span className="text-xs text-red-400">Alert</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span className="text-xs text-green-400">Normal</span>
                        </div>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
          {sessionLog.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Waiting for data...</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
