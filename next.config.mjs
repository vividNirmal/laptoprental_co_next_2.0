/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Match all domains
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Reduce bundle size in production
    if (!dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          commons: {
            name: 'commons',
            chunks: 'initial',
            minChunks: 2,
            enforce: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    // Minimize JS parsing time
    config.optimization.minimize = !dev;
    
    return config;
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Remove modularizeImports as it's causing import issues
  // modularizeImports: {
  //   'lucide-react': {
  //     transform: 'lucide-react/dist/esm/icons/{{member}}',
  //     skipDefaultConversion: true,
  //   },
  // },

  experimental: {
    // optimizeCss: true, // Disabled - requires critters package
    optimizeServerReact: true,
    // Remove legacy support for better performance
    legacyBrowsers: false,
    // Enable modern bundle splitting
    esmExternals: true,
    // Reduce polyfills
    browsersListForSwc: true,
  },
  
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
