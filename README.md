# 🚗 VolksGuardian: AI-Powered Driver Wellness Monitoring Dashboard

**VolksGuardian** is an AI-driven driver wellness and fatigue monitoring system built with **Next.js**, **TypeScript**, and **Computer Vision**.  
It continuously assesses driver alertness through facial metrics, gaze tracking, and neural indicators — providing **real-time visual insights**, **fatigue alerts**, and **analytic dashboards** to promote safer, more mindful driving.

---

## ✨ Features

- 🎥 **Live Camera Feed** – Real-time face and eye tracking using the browser camera (MediaPipe simulation).
- 🧠 **AI-Based Fatigue Detection** – Calculates fatigue using:
  - Eye Aspect Ratio (EAR)
  - Blink Rate & PERCLOS (eye closure)
  - CNN-based fatigue score
  - Heart Rate (simulated)
  - Mouth Aspect Ratio (yawning)
  - Gaze Deviation & Head Nod Detection
- 🧩 **Dynamic Visual Overlays** – Face landmarks, gaze indicators, and fatigue status drawn live over the video.
- 🔔 **Smart Alerts** – Critical and warning alerts for:
  - High fatigue
  - Drowsiness
  - Eyes off-road
  - Yawning or head nods
- ⚙️ **Customizable Settings** – Tune fatigue and PERCLOS thresholds, enable audio or LLM-based alerts.
- 📊 **Analytics & Logs** – Explore fatigue trends, metric distributions, and export detailed logs in CSV.
- 💎 **Modern UI** – Gradient-rich dark theme, responsive design, and smooth animations for clarity and aesthetics.

---

## 🚀 Getting Started

### 🧩 Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm or yarn package manager

### ⚙️ Installation

```bash
# Clone the repository
git https://github.com/jovan-08/VolksGuardian.git
cd VolksGuardian


```
