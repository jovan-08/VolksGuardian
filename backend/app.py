"""
Driver Wellness Monitoring — Phase 11.4 (Core Intelligence Upgrade, No Frontend)
--------------------------------------------------------------------------------
Back-end only. Keeps HUD/CSV. Adds:
- CalibrationWizard (EAR baseline, robust warmup)
- Reliable Blink Counter (min-close + refractory)
- TrendTracker (EMA + slope + stability score)
- FusionEngine (RL-lite adaptive reweighting of visual vs CNN)
- Metric-aware LLM feedback (explains *why* it alerted)
- Session summary (min/max/avg + time-in-fatigue) to console + CSV

Dependencies:
  pip install opencv-python mediapipe tensorflow-macos==2.16.1 tensorflow-metal==1.1.0 playsound3 pyttsx3
Optional (voice stress):
  pip install sounddevice
"""

import os, cv2, time, random, threading, subprocess, numpy as np, csv, queue, math
from collections import deque
import tensorflow as tf
from playsound3 import playsound
import pyttsx3
import mediapipe as mp

# =========================== CONFIG ===========================
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["CUDA_VISIBLE_DEVICES"] = "0"

USE_OLLAMA = True
ALERT_SOUND = "alert.wav"
IMG_SIZE = 224

LOG_PATH = "driver_wellness_p11_4.csv"
SUMMARY_PATH = "driver_wellness_p11_4_summary.csv"

# Voice capture (optional)
AUDIO_RATE = 16000
AUDIO_BLOCK_SEC = 0.5   # VSI ~2 Hz
AUDIO_ENABLE = True     # set False to disable mic input

# Fatigue trigger (on DWI)
DWI_HIGH = 0.70
DWI_LOW  = 0.45
COOLDOWN_S = 15

# CNN model paths
MODEL_PATHS = [
    "/Users/mayankchauhan/Documents/IMobileThon/best_drowsiness_model.h5",
    "/Users/mayankchauhan/Documents/IMobileThon/driver_fatigue_detector_v1.h5"
]
TFLITE_PATH = "/Users/mayankchauhan/Documents/IMobileThon/driver_fatigue_detector_v1.tflite"

# ======================== MODEL LOADING =======================
def load_model():
    for p in MODEL_PATHS:
        if os.path.exists(p):
            print(f"✅ Loading {p}")
            try:
                m = tf.keras.models.load_model(p, compile=False)
                m.trainable = False
                return m, False
            except Exception as e:
                print(f"⚠️ Error loading {p}: {e}")
    if os.path.exists(TFLITE_PATH):
        print("✅ Loading TFLite model")
        inter = tf.lite.Interpreter(model_path=TFLITE_PATH)
        inter.allocate_tensors()
        return inter, True
    raise FileNotFoundError("❌ No model found!")

model, IS_TFLITE = load_model()

def predict_model(frame):
    img = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
    img = np.expand_dims(img.astype("float32") / 255.0, axis=0)
    if IS_TFLITE:
        inp = model.get_input_details()
        out = model.get_output_details()
        model.set_tensor(inp[0]['index'], img)
        model.invoke()
        res = model.get_tensor(out[0]['index'])
        prob = float(res[0][0])
    else:
        prob = float(model.predict(img, verbose=0)[0][0])
    return float(np.clip(prob, 0.0, 1.0))

# ========================= TTS THREAD =========================
class TTSWorker(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.q = queue.Queue()
        self.tts = pyttsx3.init()
        self.tts.setProperty("rate", 175)
        self.tts.setProperty("volume", 1.0)
    def run(self):
        while True:
            txt = self.q.get()
            try:
                self.tts.say(txt); self.tts.runAndWait()
            except Exception as e:
                print("[TTS Error]", e)
    def speak(self, txt): self.q.put(txt)

tts_worker = TTSWorker(); tts_worker.start()

# ============================ AUDIO ===========================
class AudioController:
    def __init__(self): self.last_alert = 0
    def play_alert(self):
        if time.time() - self.last_alert < 5: return
        self.last_alert = time.time()
        threading.Thread(target=self._sound, daemon=True).start()
    def _sound(self):
        try:
            if os.path.exists(ALERT_SOUND): playsound(ALERT_SOUND, block=False)
            else: print("\a")
        except Exception as e: print("[Alert Error]", e)
    def speak(self, txt): tts_worker.speak(txt)

# ========================= OLLAMA AI ==========================
class LLMWorker(threading.Thread):
    def __init__(self, audio):
        super().__init__(daemon=True)
        self.audio = audio
        self.q = queue.Queue()
        self.last_message = None
    def enqueue(self, context_text):
        """Queue a contextual message (already summarized by backend)"""
        self.q.put(context_text)
    def run(self):
        while True:
            try:
                context_text = self.q.get()
                msg = context_text
                if USE_OLLAMA:
                    try:
                        proc = subprocess.Popen(
                            ["ollama", "run", "llama3",
                             f"Driver assistance: Say a short supportive one-liner based on: {context_text}"],
                            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True
                        )
                        out, _ = proc.communicate(timeout=6)
                        msg = (out or "").strip() or context_text
                    except Exception as e:
                        print("[Ollama error]", e)
                        msg = context_text
                self.last_message = msg
                self.audio.speak(msg)
            except Exception as e:
                print("[LLMWorker Error]", e)
                time.sleep(0.1)

# ========================= SENSORS (Sim) ======================
class HeartSource:
    def __init__(self): self.hr=78; self.hrv=40
    def read(self):
        self.hr  += random.choice([-1,0,1])
        self.hrv += random.choice([-2,-1,0,1])
        return {"hr": int(np.clip(self.hr,60,110)),
                "hrv": int(np.clip(self.hrv,15,80))}

class SteeringSource:
    def __init__(self): self.buf=deque(maxlen=100); self.t=0
    def read(self):
        self.t+=0.05
        v=0.03*np.sin(self.t)+0.01*np.random.randn()
        self.buf.append(v)
        return {"micro_var": float(np.std(self.buf))}

class IMUSource:
    def __init__(self): self.buf=deque(maxlen=50)
    def read(self):
        a=0.002*np.random.randn(); self.buf.append(a)
        return {"accel_var": float(np.var(self.buf))}

# ==================== VOICE STRESS (VSI) ======================
class VoiceStressWorker(threading.Thread):
    def __init__(self, rate=AUDIO_RATE, block_sec=AUDIO_BLOCK_SEC, enable=AUDIO_ENABLE):
        super().__init__(daemon=True)
        self.rate = rate
        self.block = int(rate*block_sec)
        self.enable = enable
        self.last_vsi = 0.0
        self.ok = False
        self._stop = False
        try:
            if not enable: raise RuntimeError("Audio disabled by config")
            import sounddevice as sd
            self.sd = sd
            self.ok = True
        except Exception as e:
            print("🔇 Voice stress disabled (sounddevice not available or disabled).", e)
    @staticmethod
    def _zcr(x): return float(((x[:-1]*x[1:])<0).sum())/len(x)
    @staticmethod
    def _spectral_centroid(x, sr):
        n=len(x); 
        if n<=8: return 0.0
        win=np.hanning(n); X=np.abs(np.fft.rfft(x*win)); freqs=np.fft.rfftfreq(n,1/sr)
        s=X.sum(); 
        if s<1e-8: return 0.0
        return float((freqs*X).sum()/s)
    def _frame_vsi(self, x):
        x=x.astype(np.float32); mx=max(1e-6, np.max(np.abs(x))); x=x/mx
        rms=float(np.sqrt(np.mean(x*x))); zcr=self._zcr(x); sc=self._spectral_centroid(x,self.rate)
        rms_n=np.clip((rms-0.02)/0.25,0,1); zcr_n=np.clip((zcr-0.02)/0.25,0,1); sc_n=np.clip(sc/4000.0,0,1)
        vsi=0.5*rms_n+0.3*zcr_n+0.2*sc_n
        self.last_vsi=0.8*self.last_vsi+0.2*float(vsi)
        return float(np.clip(self.last_vsi,0,1))
    def run(self):
        if not self.ok: return
        q=queue.Queue(maxsize=4)
        def cb(indata, frames, time_info, status):
            try: q.put_nowait(indata.copy())
            except queue.Full: pass
        with self.sd.InputStream(channels=1, samplerate=self.rate, blocksize=self.block, callback=cb):
            while not self._stop:
                try:
                    data=q.get(timeout=1.0)
                    _=self._frame_vsi(data[:,0])
                except Exception:
                    pass
    def stop(self): self._stop=True

# ======================= SUPPORT CLASSES ======================
class CalibrationWizard:
    """
    Robust EAR baseline during first warmup_s seconds.
    Ignores frames with large head motion. Produces baseline EAR and threshold.
    """
    def __init__(self, warmup_s=10.0):
        self.warmup_s = warmup_s
        self.start = time.time()
        self.samples = []
        self.ready = False
        self.baseline_ear = None
        self.ear_T = 0.23
    def update(self, smooth_ear, head_motion, motion_tol):
        if self.ready: return self.baseline_ear, self.ear_T, True
        if time.time() - self.start <= self.warmup_s:
            if head_motion < motion_tol*0.8:
                self.samples.append(smooth_ear)
        if (time.time() - self.start) > self.warmup_s:
            if len(self.samples) >= 20:
                self.baseline_ear = float(np.median(self.samples))
                self.ear_T = 0.70 * self.baseline_ear
            else:
                # fallback
                self.baseline_ear = smooth_ear
                self.ear_T = 0.70 * smooth_ear
            self.ready = True
        return self.baseline_ear, self.ear_T, self.ready

class TrendTracker:
    """
    Tracks EMA and slope for signals; provides stability score (0..1).
    """
    def __init__(self, alpha=0.1, window_s=15.0, fps_est=30):
        self.alpha = alpha
        self.ema = None
        self.buf = deque(maxlen=int(window_s*fps_est))
    def update(self, x):
        self.ema = x if self.ema is None else (1-self.alpha)*self.ema + self.alpha*x
        self.buf.append(x)
        slope = 0.0
        if len(self.buf) >= 5:
            y = np.array(self.buf)
            t = np.arange(len(y))
            # simple slope via least squares
            denom = (t*t).sum() - (t.sum()**2)/len(t)
            if denom > 1e-6:
                slope = ((t*y).sum() - t.sum()*y.mean()) / denom
        # stability: lower variance => closer to 1
        var = np.var(self.buf) if len(self.buf) > 3 else 0.0
        stab = float(np.clip(1.0 / (1.0 + 200*var), 0.0, 1.0))
        return self.ema, slope, stab

class FusionEngine:
    """
    RL-lite: dynamically reweights visual vs CNN based on agreement with PERLCOS trend.
    """
    def __init__(self):
        self.w_visual = 0.6
        self.w_cnn    = 0.4
    def fuse(self, visual, cnn):
        return np.clip(self.w_visual*visual + self.w_cnn*cnn, 0, 1)
    def adapt(self, perclos_slope, visual, cnn):
        # If PERCLOS rising and visual > cnn → trust visual a bit more
        if perclos_slope > 0 and visual > cnn + 0.05:
            self.w_visual += 0.01
            self.w_cnn    -= 0.01
        # If PERCLOS falling and cnn < visual → trust cnn a bit more
        if perclos_slope < 0 and cnn + 0.05 < visual:
            self.w_visual -= 0.005
            self.w_cnn    += 0.005
        # keep normalized and bounded
        self.w_visual = float(np.clip(self.w_visual, 0.3, 0.8))
        self.w_cnn    = float(np.clip(1.0 - self.w_visual, 0.2, 0.7))

# ======================= VISION MODULE ========================
class VisionModule:
    LEFT=[33,160,158,133,153,144]
    RIGHT=[362,385,387,263,373,380]
    HEAD_POINTS=[1,33,263]

    def __init__(self, warmup_s=10.0, perclos_horizon_s=30.0):
        self.mesh = mp.solutions.face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True)
        self.draw = mp.solutions.drawing_utils
        self.ear_hist = deque(maxlen=15)
        self.closed_samples = deque()
        self.blink_times = deque(maxlen=120)
        # Blink logic parameters
        self.frames_closed = 0
        self.min_close_frames = 3      # min frames eyes closed to count a blink
        self.refractory_s = 0.25       # min time between blinks
        self.last_blink_time = 0.0

        self.EAR_T = 0.23
        self.motion_tolerance = 0.015
        self.last_head_pos = None

        self.calib = CalibrationWizard(warmup_s=warmup_s)
        self.perclos_horizon_s = perclos_horizon_s

        self.fatigue = 0.0
        self.visual_last = 0.0

    def _ear(self, lm, idx, w, h):
        def p(i): return np.array([lm[idx[i]].x*w, lm[idx[i]].y*h])
        p1,p2,p3,p4,p5,p6 = [p(i) for i in range(6)]
        vert=(np.linalg.norm(p2-p6)+np.linalg.norm(p3-p5))/2
        horiz=np.linalg.norm(p1-p4)+1e-6
        return vert/horiz

    def _head_motion(self, lm, w, h):
        pts = [np.array([lm[i].x*w, lm[i].y*h]) for i in self.HEAD_POINTS]
        center = np.mean(pts, axis=0)
        if self.last_head_pos is None:
            self.last_head_pos = center
            return 0.0
        dist = np.linalg.norm(center - self.last_head_pos) / w
        self.last_head_pos = center
        return dist

    def _update_perclos(self, is_closed):
        now = time.time()
        self.closed_samples.append((now, 1 if is_closed else 0))
        while self.closed_samples and now - self.closed_samples[0][0] > self.perclos_horizon_s:
            self.closed_samples.popleft()
        if not self.closed_samples: return 0.0
        vals = [c for _, c in self.closed_samples]
        return sum(vals)/len(vals)

    def _blink_rate_per_min(self):
        now = time.time()
        # drop older than 60s
        while self.blink_times and now - self.blink_times[0] > 60:
            self.blink_times.popleft()
        return len(self.blink_times)

    def step(self, frame, cnn_prob, dwi_hint_for_adapt, perclos_tracker: TrendTracker, fusion: FusionEngine):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w, _ = frame.shape
        res = self.mesh.process(rgb)
        ear = 0.0; blink_rate = 0.0; perclos = 0.0

        if res.multi_face_landmarks:
            lm = res.multi_face_landmarks[0].landmark
            l = self._ear(lm, self.LEFT, w, h)
            r = self._ear(lm, self.RIGHT, w, h)
            ear = (l + r) / 2.0
            self.ear_hist.append(ear)
            smooth_ear = float(np.mean(self.ear_hist))

            head_motion = self._head_motion(lm, w, h)

            # Calibration / Threshold
            base_ear, ear_T, ready = self.calib.update(smooth_ear, head_motion, self.motion_tolerance)
            if ready:
                self.EAR_T = 0.9*self.EAR_T + 0.1*ear_T  # soft settle
            else:
                # Pre-ready: provisional threshold toward 0.7 * current baseline
                self.EAR_T = 0.9*self.EAR_T + 0.1*(0.70*(base_ear if base_ear else smooth_ear))

            # Valid close only if head is not moving much
            is_closed = (smooth_ear < self.EAR_T) if head_motion < self.motion_tolerance else False

            # Blink detection with min-close + refractory
            if is_closed:
                self.frames_closed += 1
            else:
                if self.frames_closed >= self.min_close_frames:
                    now = time.time()
                    if now - self.last_blink_time >= self.refractory_s:
                        self.blink_times.append(now)
                        self.last_blink_time = now
                self.frames_closed = 0

            blink_rate = self._blink_rate_per_min()
            perclos = self._update_perclos(is_closed)

            # Visual fatigue from EAR + PERCLOS + Blinks
            ear_def = np.clip((self.EAR_T - smooth_ear)/(self.EAR_T*0.6), 0, 1)
            blink_pen = np.clip((15.0 - blink_rate)/15.0, 0, 1)
            visual = 0.6*perclos + 0.25*ear_def + 0.15*blink_pen
            self.visual_last = float(visual)

            # Fusion with CNN (weights adapt separately)
            fused = fusion.fuse(visual, cnn_prob)

            # EMA with attack/decay
            α_up, α_down = 0.25, 0.1
            self.fatigue += (fused - self.fatigue) * (α_up if fused > self.fatigue else α_down)
            self.fatigue = float(np.clip(self.fatigue, 0, 1))

            # Trend info for adaptation
            _, perclos_slope, _ = perclos_tracker.update(perclos)
            fusion.adapt(perclos_slope, visual, cnn_prob)

            # Draw landmarks
            self.draw.draw_landmarks(frame, res.multi_face_landmarks[0],
                mp.solutions.face_mesh.FACEMESH_CONTOURS)

        return {
            "ear": ear,
            "blink_per_min": blink_rate,
            "perclos_30s": perclos,
            "fatigue": self.fatigue,
            "ear_thresh": float(self.EAR_T),
            "visual": self.visual_last
        }, frame

# =========================== LOGGING ==========================
def log_row(ts, ear, blinkpm, perclos, cnn, fatigue, cli, vsi, dwi, action, ear_t, wv, wc):
    header = ["time","ear","blink_per_min","perclos_30s","cnn","fatigue","CLI","VSI","DWI","action","EAR_T","w_visual","w_cnn"]
    exists = os.path.exists(LOG_PATH)
    with open(LOG_PATH, "a", newline="") as f:
        w = csv.writer(f)
        if not exists: w.writerow(header)
        w.writerow([ts, ear, blinkpm, perclos, cnn, fatigue, cli, vsi, dwi, action or "none", ear_t, wv, wc])

def write_summary(stats):
    exists = os.path.exists(SUMMARY_PATH)
    with open(SUMMARY_PATH, "a", newline="") as f:
        w = csv.writer(f)
        if not exists:
            w.writerow([
                "session_start","session_end","duration_s",
                "avg_fatigue","min_fatigue","max_fatigue",
                "avg_blink_per_min","time_above_high_s"
            ])
        w.writerow([
            stats["start"], stats["end"], int(stats["duration_s"]),
            round(stats["avg_fatigue"],3), round(stats["min_fatigue"],3), round(stats["max_fatigue"],3),
            round(stats["avg_blink"],2), int(stats["time_above_high_s"])
        ])

# ============================ MAIN ============================
def main():
    # Engines
    fusion = FusionEngine()
    perclos_tracker = TrendTracker(alpha=0.1, window_s=30.0, fps_est=30)

    # Workers
    audio  = AudioController()
    llm    = LLMWorker(audio); llm.start()

    # Sensors
    heart  = HeartSource()
    steer  = SteeringSource()
    imu    = IMUSource()
    vstress = VoiceStressWorker(); vstress.start()

    # Vision
    vision = VisionModule(warmup_s=10.0, perclos_horizon_s=30.0)

    # Camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError("❌ Could not open default camera.")

    # Stats for session summary
    session_start = time.time()
    fatigue_series = []
    blink_series = []
    time_above_high = 0.0
    last_above_t = None

    # Trigger state
    last_action = None
    last_trigger_t = 0.0

    prev = time.time(); fps = 0.0
    dwi_for_adapt = 0.0  # hint to vision for adaptation

    print("🚗 Running Phase 11.4 (Core Intelligence Upgrade, No Frontend)")

    while True:
        ok, frame = cap.read()
        if not ok: break

        cnn_prob = predict_model(frame)

        vis, overlay = vision.step(frame, cnn_prob, dwi_for_adapt, perclos_tracker, fusion)
        f     = vis["fatigue"]
        ear   = vis["ear"]
        br    = vis["blink_per_min"]
        pcl   = vis["perclos_30s"]
        ear_t = vis["ear_thresh"]
        visual = vis["visual"]

        heart_m = heart.read()
        steer_m = steer.read()
        imu_m   = imu.read()
        hr, hrv = heart_m["hr"], heart_m["hrv"]

        # Cognitive Load Index (simple proxy)
        cli = np.clip(0.5*(steer_m["micro_var"]/0.02) + 0.5*(1 - min(br/20.0,1)), 0, 1)

        # Voice Stress Index (0..1)
        vsi = float(np.clip(getattr(vstress, "last_vsi", 0.0), 0.0, 1.0))

        # Driver Wellness Index (DWI) — include motion a bit
        dwi = np.clip(
            0.45*f +                 # fused fatigue (visual+cnn)
            0.10*((80 - hrv)/65) +   # physio HRV penalty
            0.20*cli +               # cognitive load
            0.15*vsi +               # voice stress
            0.10*(imu_m["accel_var"]/0.001), 0, 1
        )
        dwi_for_adapt = float(dwi)

        # Session stats
        fatigue_series.append(f)
        blink_series.append(br)

        now = time.time()
        if dwi >= DWI_HIGH:
            if last_above_t is None:
                last_above_t = now
        else:
            if last_above_t is not None:
                time_above_high += (now - last_above_t)
                last_above_t = None

        # FPS (smoothed)
        fps = 0.9*fps + 0.1*(1.0 / max(1e-3, (now - prev)))
        prev = now

        # Hysteresis trigger on DWI
        can_trigger = (now - last_trigger_t) > COOLDOWN_S
        if can_trigger and dwi >= DWI_HIGH:
            # Decide "why" (dominant factor)
            reasons = []
            if visual > 0.55: reasons.append("eye-fatigue (PERCLOS/blinks)")
            if vsi > 0.55:    reasons.append("voice stress")
            if cli > 0.55:    reasons.append("cognitive load")
            dom = ", ".join(reasons) if reasons else "overall workload"

            # Choose action
            a = random.choice(["beep_alert","speak_break","speak_breathing"])
            last_action = a; last_trigger_t = now

            # Audio + LLM contextual message
            if a == "beep_alert": audio.play_alert()
            ctx = f"DWI {dwi:.2f}. Likely causes: {dom}. Suggestion aligned to '{a}'."
            llm.enqueue(ctx)

        if dwi <= DWI_LOW and (now - last_trigger_t) > 3.0:
            last_action = None

        # ---------------- HUD ----------------
        cv2.rectangle(overlay, (0,0), (overlay.shape[1], 170), (25,25,25), -1)
        hud1 = (f"EAR:{ear:.3f} (T:{ear_t:.3f}) | Blink/min:{br:.0f} | PERCLOS30:{pcl:.2f} | "
                f"CNN:{cnn_prob:.2f} | Fatigue:{f:.2f} | HR:{hr} HRV:{hrv} | FPS:{fps:.1f}")
        hud2 = (f"VSI:{vsi:.2f} | CLI:{cli:.2f} | DWI:{dwi:.2f} | wV:{fusion.w_visual:.2f} wC:{fusion.w_cnn:.2f}")
        cv2.putText(overlay, hud1, (10,40), 0, 0.55, (255,255,255), 2)
        cv2.putText(overlay, hud2, (10,70), 0, 0.55, (255,255,255), 2)

        # DWI bar
        bar_w = 360; x0, y0 = 10, 100
        cv2.rectangle(overlay,(x0,y0),(x0+bar_w,y0+22),(60,60,60),1)
        cv2.rectangle(overlay,(x0+1,y0+1),(x0+1+int(bar_w*dwi),y0+21),
                      (0,200,0) if dwi<0.5 else ((0,200,200) if dwi<0.7 else (0,0,255)),-1)

        # Last LLM line
        # (Shown for context; not a "frontend" — just HUD text)
        # if needed:
        # if llm.last_message:
        #     cv2.putText(overlay, llm.last_message[:90], (10, overlay.shape[0]-15),
        #                 0, 0.6, (200,255,200), 2)

        # Log
        log_row(time.time(), ear, br, pcl, cnn_prob, f, cli, vsi, dwi, last_action,
                ear_t, fusion.w_visual, fusion.w_cnn)

        # Show
        cv2.imshow("Driver Wellness (Phase 11.4 Core Intelligence)", overlay)
        if cv2.waitKey(1) & 0xFF == 27: break
        time.sleep(0.005)

    # Close
    cap.release(); cv2.destroyAllWindows()
    try: vstress.stop()
    except: pass

    # Summary
    session_end = time.time()
    if last_above_t is not None:
        time_above_high += (session_end - last_above_t)

    avg_f = float(np.mean(fatigue_series)) if fatigue_series else 0.0
    min_f = float(np.min(fatigue_series)) if fatigue_series else 0.0
    max_f = float(np.max(fatigue_series)) if fatigue_series else 0.0
    avg_b = float(np.mean(blink_series)) if blink_series else 0.0

    summary = {
        "start": int(session_start),
        "end": int(session_end),
        "duration_s": session_end - session_start,
        "avg_fatigue": avg_f, "min_fatigue": min_f, "max_fatigue": max_f,
        "avg_blink": avg_b,
        "time_above_high_s": time_above_high
    }

    write_summary(summary)
    print("\n================ Session Summary ================")
    print(f"Duration: {int(summary['duration_s'])} s")
    print(f"Fatigue avg/min/max: {avg_f:.3f} / {min_f:.3f} / {max_f:.3f}")
    print(f"Avg blink/min: {avg_b:.1f}")
    print(f"Time above high (DWI≥{DWI_HIGH}): {int(time_above_high)} s")
    print("Summary written to:", SUMMARY_PATH)
    print("🛑 Session Ended.")

# ============================ BOOT ============================
if __name__ == "__main__":
    main()
