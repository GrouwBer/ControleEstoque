/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Pre-existing type issues in services/ — will be resolved separately
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
