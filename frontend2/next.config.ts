import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ✅ Ignore build-time TypeScript errors on Vercel / next build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
