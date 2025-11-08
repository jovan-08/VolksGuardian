import { create } from "zustand"

export interface WellnessData {
  time: string
  ear: number
  blink_per_min: number
  perclos_30s: number
  cnn: number
  fatigue: number
  hr: number
  hrv: number
  fps: number
  action: string
}

interface DashboardStore {
  currentData: WellnessData | null
  sessionLog: WellnessData[]
  settings: {
    fatigueThreshold: number
    perclosThreshold: number
    audioAlerts: boolean
    llmAlerts: boolean
  }
  setCurrentData: (data: WellnessData) => void
  addToSessionLog: (data: WellnessData) => void
  updateSettings: (settings: Partial<DashboardStore["settings"]>) => void
  clearSessionLog: () => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  currentData: null,
  sessionLog: [],
  settings: {
    fatigueThreshold: 70,
    perclosThreshold: 0.8,
    audioAlerts: true,
    llmAlerts: false,
  },
  setCurrentData: (data) => set({ currentData: data }),
  addToSessionLog: (data) =>
    set((state) => ({
      sessionLog: [data, ...state.sessionLog].slice(0, 100),
    })),
  updateSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),
  clearSessionLog: () => set({ sessionLog: [] }),
}))
