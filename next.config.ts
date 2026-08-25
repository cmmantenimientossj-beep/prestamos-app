import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  swcMinify: false,
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://fake-url-for-build.com",
  }
};

export default withPWA(nextConfig);
