import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://fake-url-for-build.com",
  }
};

export default withPWA(nextConfig);
