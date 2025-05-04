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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'child_process' and other node-specific modules on the client
      config.resolve.fallback = {
        fs: false,
        child_process: false,
        net: false,
        tls: false,
        dns: false,
      }
    }
    return config;
  },
  experimental: {
    // Enable more modern features
    esmExternals: true,
  },
}

export default nextConfig
