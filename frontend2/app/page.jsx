"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  Activity,
  Eye,
  Heart,
  Gauge,
  TrendingUp,
  Bell,
  Moon,
  Sun,
  Waves,
  Brain,
  Navigation,
  Camera,
  Video,
  VideoOff,
  Maximize2,
  Minimize2,
  Menu,
  X,
  Settings,
  BarChart3,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Volume2,
  MessageSquare,
  Save,
  RotateCcw,
  Download,
  Filter,
  Calendar,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from "recharts";

const DriverWellnessDashboard = () => {
  const [activeTab, setActiveTab] = useState("monitoring");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = (useRef < HTMLVideoElement) | (null > null);
  const canvasRef = (useRef < HTMLCanvasElement) | (null > null);

  // Settings state
  const [settings, setSettings] = useState({
    fatigueThreshold: 70,
    perclosThreshold: 80,
    audioAlerts: true,
    llmAlerts: false,
  });

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState("all");

  const [currentData, setCurrentData] = useState({
    ear: 0.28,
    blinkPerMin: 18,
    perclos30s: 0.12,
    cnn: 0.15,
    fatigue: 0.35,
    hr: 78,
    mar: 0.25,
    gazeDev: 0.15,
    headNod: false,
    fps: 30,
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [alert, setAlert] = useState(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            facingMode: "user",
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
          setIsConnected(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setIsCameraActive(false);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Simulate face landmarks overlay
  useEffect(() => {
    const drawOverlay = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video || !isCameraActive) return;

      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Face outline
      ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 80, 110, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Eyes
      ctx.fillStyle =
        currentData.ear < 0.23
          ? "rgba(239, 68, 68, 0.8)"
          : "rgba(34, 197, 94, 0.8)";
      ctx.beginPath();
      ctx.ellipse(centerX - 30, centerY - 20, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(centerX + 30, centerY - 20, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.strokeStyle =
        currentData.mar > 0.6
          ? "rgba(251, 146, 60, 0.8)"
          : "rgba(59, 130, 246, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(
        centerX,
        centerY + 40,
        25,
        currentData.mar > 0.6 ? 20 : 8,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Gaze direction indicator
      const gazeOffsetX = (currentData.gazeDev - 0.3) * 50;
      ctx.fillStyle =
        currentData.gazeDev > 0.4
          ? "rgba(234, 179, 8, 0.8)"
          : "rgba(59, 130, 246, 0.8)";
      ctx.beginPath();
      ctx.arc(centerX - 30 + gazeOffsetX, centerY - 20, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 30 + gazeOffsetX, centerY - 20, 4, 0, Math.PI * 2);
      ctx.fill();

      // Status indicators
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(`EAR: ${currentData.ear.toFixed(3)}`, 10, 30);
      ctx.fillText(`Blinks: ${currentData.blinkPerMin}/min`, 10, 55);
      ctx.fillText(
        `Fatigue: ${(currentData.fatigue * 100).toFixed(0)}%`,
        10,
        80
      );

      // Alert overlay
      if (currentData.fatigue > settings.fatigueThreshold / 100) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillStyle = "rgba(239, 68, 68, 1)";
        ctx.textAlign = "center";
        ctx.fillText(
          "⚠️ HIGH FATIGUE DETECTED",
          canvas.width / 2,
          canvas.height - 40
        );
      }
    };

    const interval = setInterval(drawOverlay, 100);
    return () => clearInterval(interval);
  }, [currentData, isCameraActive, settings.fatigueThreshold]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        ear: Math.max(
          0.15,
          Math.min(0.35, currentData.ear + (Math.random() - 0.5) * 0.02)
        ),
        blinkPerMin: Math.max(
          10,
          Math.min(25, currentData.blinkPerMin + (Math.random() - 0.5) * 2)
        ),
        perclos30s: Math.max(
          0,
          Math.min(0.4, currentData.perclos30s + (Math.random() - 0.5) * 0.03)
        ),
        cnn: Math.max(
          0,
          Math.min(1, currentData.cnn + (Math.random() - 0.5) * 0.05)
        ),
        fatigue: Math.max(
          0,
          Math.min(1, currentData.fatigue + (Math.random() - 0.5) * 0.04)
        ),
        hr: Math.max(
          60,
          Math.min(100, currentData.hr + (Math.random() - 0.5) * 3)
        ),
        mar: Math.max(
          0.1,
          Math.min(0.7, currentData.mar + (Math.random() - 0.5) * 0.05)
        ),
        gazeDev: Math.max(
          0,
          Math.min(0.6, currentData.gazeDev + (Math.random() - 0.5) * 0.08)
        ),
        headNod: Math.random() > 0.95,
        fps: 30,
      };

      setCurrentData(newData);

      setHistoricalData((prev) => {
        const updated = [...prev, { time: Date.now(), ...newData }];
        return updated.slice(-60);
      });

      // Add to logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        type:
          newData.fatigue > settings.fatigueThreshold / 100 ? "alert" : "info",
        message: `Fatigue: ${(newData.fatigue * 100).toFixed(
          0
        )}%, EAR: ${newData.ear.toFixed(
          3
        )}, Blinks: ${newData.blinkPerMin.toFixed(0)}/min`,
        data: newData,
      };
      setLogs((prev) => [...prev, logEntry].slice(-100));

      if (newData.fatigue > settings.fatigueThreshold / 100) {
        setAlert({
          type: "critical",
          message: "Critical fatigue level detected! Consider taking a break.",
          time: new Date().toLocaleTimeString(),
        });
      } else if (newData.fatigue > 0.4) {
        setAlert({
          type: "warning",
          message: "Fatigue level increasing. Stay alert.",
          time: new Date().toLocaleTimeString(),
        });
      } else {
        setAlert(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentData, settings.fatigueThreshold]);

  const toggleCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraActive(!isCameraActive);
    }
  };

  const getFatigueColor = (value) => {
    if (value < 0.3) return "text-emerald-500";
    if (value < 0.5) return "text-yellow-500";
    return "text-red-500";
  };

  const getFatigueBgColor = (value) => {
    if (value < 0.3) return "bg-emerald-500";
    if (value < 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleSaveSettings = () => {
    console.log("Settings saved:", settings);
    // Here you would send settings to backend
    setAlert({
      type: "success",
      message: "Settings saved successfully!",
      time: new Date().toLocaleTimeString(),
    });
  };

  const handleResetSettings = () => {
    setSettings({
      fatigueThreshold: 70,
      perclosThreshold: 80,
      audioAlerts: true,
      llmAlerts: false,
    });
  };

  const exportLogs = () => {
    const csv = logs
      .map(
        (log) =>
          `${log.timestamp},${log.type},${log.message.replace(/,/g, ";")}`
      )
      .join("\n");
    const blob = new Blob([`Timestamp,Type,Message\n${csv}`], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fatigue-logs-${Date.now()}.csv`;
    a.click();
  };

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    unit,
    color = "text-blue-400",
    subtext,
  }) => (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-6 h-6 ${color}`} />
        <span className="text-slate-400 text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${color}`}>{value}</span>
        {unit && <span className="text-slate-500 text-sm">{unit}</span>}
      </div>
      {subtext && <p className="text-slate-500 text-xs mt-2">{subtext}</p>}
    </div>
  );

  // Sidebar content
  const sidebarItems = [
    { id: "monitoring", icon: Monitor, label: "Live Monitor" },
    { id: "settings", icon: Settings, label: "Settings" },
    { id: "logs", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-r border-slate-800/50 transition-all duration-300 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NeuralNexus
                </h2>
                <p className="text-xs text-slate-500 mt-1">Phase 10.8</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-lg shadow-blue-500/10"
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Connection Status */}
        <div className="p-4 border-t border-slate-800/50">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isConnected
                ? "bg-emerald-500/10 border border-emerald-500/30"
                : "bg-slate-800/50"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            {!sidebarCollapsed && (
              <span className="text-xs text-slate-400">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {activeTab === "monitoring"
                    ? "Live Monitoring"
                    : activeTab === "settings"
                    ? "System Settings"
                    : "Analytics & Logs"}
                </h1>
                <p className="text-slate-400 text-sm">
                  {activeTab === "monitoring"
                    ? "Real-time driver wellness monitoring"
                    : activeTab === "settings"
                    ? "Configure system parameters and alert thresholds"
                    : "View detailed metrics and export data"}
                </p>
              </div>
            </div>
          </div>

          {/* Alert Banner */}
          {alert && (
            <div className="max-w-7xl mx-auto mb-6">
              <Alert
                className={`${
                  alert.type === "critical"
                    ? "bg-red-500/10 border-red-500/50"
                    : alert.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/50"
                    : "bg-yellow-500/10 border-yellow-500/50"
                } backdrop-blur-sm`}
              >
                <AlertCircle
                  className={`h-5 w-5 ${
                    alert.type === "critical"
                      ? "text-red-400"
                      : alert.type === "success"
                      ? "text-emerald-400"
                      : "text-yellow-400"
                  }`}
                />
                <AlertDescription
                  className={`${
                    alert.type === "critical"
                      ? "text-red-200"
                      : alert.type === "success"
                      ? "text-emerald-200"
                      : "text-yellow-200"
                  } font-medium`}
                >
                  {alert.message}{" "}
                  <span className="text-xs opacity-75">({alert.time})</span>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto">
            {activeTab === "monitoring" && (
              <div className="space-y-6">
                {/* Camera Feed Section */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Live Camera Feed */}
                  <div
                    className={`${
                      isFullscreen ? "lg:col-span-3" : "lg:col-span-2"
                    } bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-2xl`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
                        <Camera className="w-7 h-7 text-blue-400" />
                        Live Camera Feed
                        {isCameraActive && (
                          <span className="flex items-center gap-2 text-sm font-normal text-emerald-400">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            Recording
                          </span>
                        )}
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleCamera}
                          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                          title={
                            isCameraActive ? "Stop Camera" : "Start Camera"
                          }
                        >
                          {isCameraActive ? (
                            <Video className="w-5 h-5 text-blue-400" />
                          ) : (
                            <VideoOff className="w-5 h-5 text-red-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                          title={
                            isFullscreen ? "Exit Fullscreen" : "Fullscreen"
                          }
                        >
                          {isFullscreen ? (
                            <Minimize2 className="w-5 h-5 text-slate-400" />
                          ) : (
                            <Maximize2 className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div
                      className="relative bg-black rounded-2xl overflow-hidden"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                      />

                      {!isCameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                          <div className="text-center">
                            <VideoOff className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Camera is off</p>
                          </div>
                        </div>
                      )}

                      {/* Live Stats Overlay */}
                      {isCameraActive && (
                        <div className="absolute top-4 right-4 space-y-2">
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  currentData.ear < 0.23
                                    ? "bg-red-400"
                                    : "bg-emerald-400"
                                } animate-pulse`}
                              />
                              <span className="text-white font-semibold">
                                Eyes:{" "}
                                {currentData.ear < 0.23 ? "CLOSED" : "OPEN"}
                              </span>
                            </div>
                          </div>
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Eye className="w-3 h-3 text-cyan-400" />
                              <span className="text-white">
                                EAR: {currentData.ear.toFixed(3)}
                              </span>
                            </div>
                          </div>
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Activity className="w-3 h-3 text-blue-400" />
                              <span className="text-white">
                                Blinks: {currentData.blinkPerMin}/min
                              </span>
                            </div>
                          </div>
                          <div
                            className={`backdrop-blur-sm rounded-lg px-3 py-2 text-xs ${
                              currentData.fatigue > 0.5
                                ? "bg-red-500/70"
                                : currentData.fatigue > 0.3
                                ? "bg-yellow-500/70"
                                : "bg-emerald-500/70"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Brain className="w-3 h-3 text-white" />
                              <span className="text-white font-semibold">
                                Fatigue:{" "}
                                {(currentData.fatigue * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Detection Indicators */}
                      {isCameraActive && (
                        <div className="absolute bottom-4 left-4 flex gap-2">
                          {currentData.headNod && (
                            <div className="bg-red-500/80 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-semibold text-white animate-pulse">
                              Head Nod Detected
                            </div>
                          )}
                          {currentData.mar > 0.6 && (
                            <div className="bg-orange-500/80 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-semibold text-white animate-pulse">
                              Yawning Detected
                            </div>
                          )}
                          {currentData.gazeDev > 0.4 && (
                            <div className="bg-yellow-500/80 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-semibold text-white animate-pulse">
                              Eyes Off Road
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Camera Info */}
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <span>Resolution: 1280x720</span>
                        <span>•</span>
                        <span>FPS: {currentData.fps}</span>
                        <span>•</span>
                        <span>MediaPipe Face Mesh: Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Fatigue Level */}
                  <div
                    className={`${
                      isFullscreen ? "hidden" : "block"
                    } bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-2xl`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-slate-200 flex items-center gap-3">
                        <Brain className="w-6 h-6 text-purple-400" />
                        Fatigue Level
                      </h2>
                    </div>

                    <div className="text-center mb-6">
                      <div
                        className={`text-6xl font-black ${getFatigueColor(
                          currentData.fatigue
                        )} mb-2`}
                      >
                        {(currentData.fatigue * 100).toFixed(0)}%
                      </div>
                      <div className="text-slate-400 text-sm">
                        {currentData.fatigue < 0.3
                          ? "SAFE"
                          : currentData.fatigue < 0.5
                          ? "CAUTION"
                          : "CRITICAL"}
                      </div>
                    </div>

                    <div className="relative h-6 bg-slate-700/30 rounded-full overflow-hidden mb-6">
                      <div
                        className={`h-full ${getFatigueBgColor(
                          currentData.fatigue
                        )} transition-all duration-500 rounded-full relative`}
                        style={{ width: `${currentData.fatigue * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                        <div className="text-emerald-400 text-xs font-semibold mb-1">
                          SAFE ZONE
                        </div>
                        <div className="text-slate-400 text-xs">
                          0-30% • Normal alertness
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                        <div className="text-yellow-400 text-xs font-semibold mb-1">
                          CAUTION
                        </div>
                        <div className="text-slate-400 text-xs">
                          30-50% • Monitor closely
                        </div>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                        <div className="text-red-400 text-xs font-semibold mb-1">
                          CRITICAL
                        </div>
                        <div className="text-slate-400 text-xs">
                          50%+ • Take immediate break
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <MetricCard
                    icon={Eye}
                    label="Eye Aspect Ratio"
                    value={currentData.ear.toFixed(3)}
                    color="text-cyan-400"
                    subtext="Normal: 0.25-0.30"
                  />
                  <MetricCard
                    icon={Activity}
                    label="Blink Rate"
                    value={currentData.blinkPerMin.toFixed(0)}
                    unit="/min"
                    color="text-blue-400"
                    subtext="Normal: 15-20/min"
                  />
                  <MetricCard
                    icon={Moon}
                    label="PERCLOS (30s)"
                    value={(currentData.perclos30s * 100).toFixed(1)}
                    unit="%"
                    color="text-purple-400"
                    subtext="Eyes closed time"
                  />
                  <MetricCard
                    icon={Brain}
                    label="CNN Score"
                    value={(currentData.cnn * 100).toFixed(0)}
                    unit="%"
                    color="text-pink-400"
                    subtext="Neural network"
                  />
                  <MetricCard
                    icon={Heart}
                    label="Heart Rate"
                    value={currentData.hr}
                    unit="bpm"
                    color="text-red-400"
                    subtext="Resting: 60-100"
                  />
                  <MetricCard
                    icon={Waves}
                    label="Mouth Aspect"
                    value={currentData.mar.toFixed(2)}
                    color="text-orange-400"
                    subtext="Yawn detection"
                  />
                  <MetricCard
                    icon={Navigation}
                    label="Gaze Deviation"
                    value={(currentData.gazeDev * 100).toFixed(1)}
                    unit="%"
                    color="text-teal-400"
                    subtext="Off-road gaze"
                  />
                  <MetricCard
                    icon={Gauge}
                    label="FPS"
                    value={currentData.fps}
                    color="text-green-400"
                    subtext="Processing speed"
                  />
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Fatigue Trend */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      Fatigue Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={historicalData.slice(-30)}>
                        <defs>
                          <linearGradient
                            id="fatigueGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#a855f7"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#a855f7"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 1]} stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="fatigue"
                          stroke="#a855f7"
                          fill="url(#fatigueGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* EAR & Blink Rate */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-cyan-400" />
                      Eye Metrics
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={historicalData.slice(-30)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" hide />
                        <YAxis yAxisId="left" stroke="#64748b" />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#64748b"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="ear"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="blinkPerMin"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div
                    className={`p-6 rounded-2xl border ${
                      currentData.headNod
                        ? "bg-red-500/10 border-red-500/50"
                        : "bg-slate-800/50 border-slate-700/50"
                    } backdrop-blur-sm transition-all duration-300`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          currentData.headNod
                            ? "bg-red-400 animate-pulse"
                            : "bg-slate-600"
                        }`}
                      />
                      <span className="font-semibold">Head Nod Detection</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">
                      {currentData.headNod
                        ? "Movement detected"
                        : "Monitoring..."}
                    </p>
                  </div>

                  <div
                    className={`p-6 rounded-2xl border ${
                      currentData.mar > 0.6
                        ? "bg-orange-500/10 border-orange-500/50"
                        : "bg-slate-800/50 border-slate-700/50"
                    } backdrop-blur-sm transition-all duration-300`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          currentData.mar > 0.6
                            ? "bg-orange-400 animate-pulse"
                            : "bg-slate-600"
                        }`}
                      />
                      <span className="font-semibold">Yawn Detection</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">
                      {currentData.mar > 0.6 ? "Yawning detected" : "Normal"}
                    </p>
                  </div>

                  <div
                    className={`p-6 rounded-2xl border ${
                      currentData.gazeDev > 0.4
                        ? "bg-yellow-500/10 border-yellow-500/50"
                        : "bg-slate-800/50 border-slate-700/50"
                    } backdrop-blur-sm transition-all duration-300`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          currentData.gazeDev > 0.4
                            ? "bg-yellow-400 animate-pulse"
                            : "bg-slate-600"
                        }`}
                      />
                      <span className="font-semibold">Gaze Monitoring</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">
                      {currentData.gazeDev > 0.4
                        ? "Off-road detected"
                        : "Eyes on road"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-8">
                {/* Monitoring Thresholds */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-200 mb-2">
                      Monitoring Settings
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Configure alert thresholds and detection parameters
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Fatigue Threshold */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-400" />
                            Fatigue Alert Threshold
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">
                            Alert when fatigue exceeds this threshold
                          </p>
                        </div>
                        <span className="text-3xl font-bold text-purple-400">
                          {settings.fatigueThreshold}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={settings.fatigueThreshold}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            fatigueThreshold: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>30% (Low Sensitivity)</span>
                        <span>100% (High Sensitivity)</span>
                      </div>
                    </div>

                    {/* PERCLOS Threshold */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-cyan-400" />
                            PERCLOS Alert Threshold
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">
                            Alert when eye closure percentage exceeds this
                            threshold
                          </p>
                        </div>
                        <span className="text-3xl font-bold text-cyan-400">
                          {settings.perclosThreshold}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={settings.perclosThreshold}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            perclosThreshold: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>50% (Low Sensitivity)</span>
                        <span>100% (High Sensitivity)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Preferences */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-200 mb-2">
                      Alert Preferences
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Choose alert notification methods
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Audio Alerts Toggle */}
                    <div className="flex items-center justify-between p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                          <Volume2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-200">
                            Audio Alerts
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">
                            Play sound when fatigue threshold is exceeded
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSettings({
                            ...settings,
                            audioAlerts: !settings.audioAlerts,
                          })
                        }
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          settings.audioAlerts ? "bg-blue-500" : "bg-slate-600"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.audioAlerts ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* LLM Alerts Toggle */}
                    <div className="flex items-center justify-between p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                          <MessageSquare className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-200">
                            LLM-based Alerts
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">
                            Generate personalized alerts using AI language model
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSettings({
                            ...settings,
                            llmAlerts: !settings.llmAlerts,
                          })
                        }
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          settings.llmAlerts ? "bg-purple-500" : "bg-slate-600"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.llmAlerts ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveSettings}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-2xl font-semibold transition-all shadow-lg shadow-blue-500/25"
                  >
                    <Save className="w-5 h-5" />
                    Save Settings
                  </button>
                  <button
                    onClick={handleResetSettings}
                    className="px-6 py-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl font-semibold transition-all border border-slate-700/50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset to Defaults
                  </button>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-6">
                {/* Analytics Overview */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      {logs.length}
                    </div>
                    <div className="text-slate-400 text-sm">Total Events</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="text-3xl font-bold text-red-400 mb-1">
                      {logs.filter((l) => l.type === "alert").length}
                    </div>
                    <div className="text-slate-400 text-sm">
                      Critical Alerts
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold text-emerald-400 mb-1">
                      {(currentData.fatigue * 100).toFixed(0)}%
                    </div>
                    <div className="text-slate-400 text-sm">
                      Current Fatigue
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      {historicalData.length > 0
                        ? (
                            (historicalData.reduce(
                              (acc, d) => acc + d.fatigue,
                              0
                            ) /
                              historicalData.length) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </div>
                    <div className="text-slate-400 text-sm">Avg Fatigue</div>
                  </div>
                </div>

                {/* Metrics Distribution Chart */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-blue-400" />
                      Metrics Distribution
                    </h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: "EAR",
                          value: currentData.ear * 100,
                          fill: "#06b6d4",
                        },
                        {
                          name: "PERCLOS",
                          value: currentData.perclos30s * 100,
                          fill: "#a855f7",
                        },
                        {
                          name: "CNN",
                          value: currentData.cnn * 100,
                          fill: "#ec4899",
                        },
                        {
                          name: "Fatigue",
                          value: currentData.fatigue * 100,
                          fill: "#8b5cf6",
                        },
                        {
                          name: "MAR",
                          value: currentData.mar * 100,
                          fill: "#fb923c",
                        },
                        {
                          name: "Gaze",
                          value: currentData.gazeDev * 100,
                          fill: "#14b8a6",
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Event Log */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-purple-400" />
                      Event Log
                    </h2>
                    <div className="flex items-center gap-3">
                      <select
                        value={logFilter}
                        onChange={(e) => setLogFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="all">All Events</option>
                        <option value="alert">Alerts Only</option>
                        <option value="info">Info Only</option>
                      </select>
                      <button
                        onClick={exportLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 text-blue-400 text-sm font-semibold transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {logs
                      .filter(
                        (log) => logFilter === "all" || log.type === logFilter
                      )
                      .slice(-20)
                      .reverse()
                      .map((log, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition-all ${
                            log.type === "alert"
                              ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                              : "bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className={`p-2 rounded-lg ${
                                  log.type === "alert"
                                    ? "bg-red-500/20"
                                    : "bg-blue-500/20"
                                }`}
                              >
                                {log.type === "alert" ? (
                                  <AlertCircle className="w-4 h-4 text-red-400" />
                                ) : (
                                  <Activity className="w-4 h-4 text-blue-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-slate-200 text-sm font-medium">
                                  {log.message}
                                </p>
                                <p className="text-slate-500 text-xs mt-1">
                                  {new Date(log.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                log.type === "alert"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {log.type.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      ))}
                    {logs.filter(
                      (log) => logFilter === "all" || log.type === logFilter
                    ).length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No events recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverWellnessDashboard;
