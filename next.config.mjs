// next.config.mjs
/** @type {import('next').NextConfig} */
export const nextConfig = {
  transpilePackages: ['echarts', 'zrender', 'yahoo-finance-2'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('node-fetch')
    }
    return config
  },
}
