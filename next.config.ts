import type { NextConfig } from "next";
import nextPWA from 'next-pwa';

const withPWA = nextPWA({
  dest: 'public'
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  ...withPWA
};

export default nextConfig;
