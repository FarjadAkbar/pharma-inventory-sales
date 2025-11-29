/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_JWT_SECRET: process.env.NEXT_JWT_SECRET,
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API || 'http://localhost:3000/api',
  },
}

export default nextConfig
