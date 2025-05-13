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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 启用静态文件服务
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/src/data/:path*',
      },
    ];
  },
};

export default nextConfig;
