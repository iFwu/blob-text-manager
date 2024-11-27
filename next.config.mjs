/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features recommended for Next.js 15
  experimental: {
    // Optimizes client-side navigation for these packages
    optimizePackageImports: [
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-slot',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Only apply babel config in test environment
    if (process.env.NODE_ENV === 'test') {
      config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: './.babelrc.test.js',
          },
        },
      });
    }
    return config;
  },
};

export default nextConfig;
