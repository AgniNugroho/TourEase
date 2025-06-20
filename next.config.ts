import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Server Actions are enabled by default in Next.js 14+
  // experimental: {
  //   serverActions: true, // or { bodySizeLimit: '2mb' } for example
  // },
};

export default nextConfig;
