"use client";
import dynamic from "next/dynamic";

// 👇 Import your camera-based dashboard as a dynamic client-only component
const DriverWellnessDashboard = dynamic(
  () => import("../components/DriverWellnessDashboard"),
  { ssr: false }
);

export default function Page() {
  return <DriverWellnessDashboard />;
}
