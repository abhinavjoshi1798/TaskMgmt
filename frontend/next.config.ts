import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - devIndicators: false is valid but types may be outdated
  devIndicators: false,
  reactStrictMode: true,
};

export default nextConfig;
