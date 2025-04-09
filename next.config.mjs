/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // To disable ESLint build errors
  },
  experimental: {
    appDir: true,
  },
  output: 'standalone',
};

export default nextConfig;
