import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true', // ✅ 환경변수로 제어 (배포 시엔 비활성화)
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "mrhomes2024.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.rbs-homes.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:5180', 'localhost:3000', '127.0.0.1:5180', '127.0.0.1:3000'],
    },
  },
  async redirects() {
    return []
  },
};

export default withBundleAnalyzer(nextConfig);
