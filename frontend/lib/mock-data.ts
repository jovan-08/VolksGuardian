import type { WellnessData } from "./store"

export function generateMockWellnessData(): WellnessData {
  const now = new Date()
  return {
    time: now.toLocaleTimeString(),
    ear: 0.8 + Math.random() * 0.15,
    blink_per_min: 15 + Math.random() * 10,
    perclos_30s: 0.2 + Math.random() * 0.5,
    cnn: 0.3 + Math.random() * 0.6,
    fatigue: 30 + Math.random() * 50,
    hr: 60 + Math.random() * 30,
    hrv: 20 + Math.random() * 80,
    fps: 28 + Math.random() * 2,
    action: Math.random() > 0.9 ? "alert" : "normal",
  }
}
