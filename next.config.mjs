/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features recommended for Next.js 15
  experimental: {
    // Optimizes client-side navigation for these packages
    optimizePackageImports: [
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-slot",
      "lucide-react",
      "class-variance-authority",
      "clsx",
      "tailwind-merge"
    ]
  }
};

export default nextConfig;
