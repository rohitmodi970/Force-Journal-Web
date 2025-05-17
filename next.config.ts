import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      "cdn.pixabay.com",
      "res.cloudinary.com",
      "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      "images.unsplash.com",
      "drive.google.com",
      "lh3.googleusercontent.com",
      "lh1.googleusercontent.com",
      "lh2.googleusercontent.com",
      "lh4.googleusercontent.com",
      "lh5.googleusercontent.com",
      "lh6.googleusercontent.com",
      "letsenhance.io"
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb' // Increase the body size limit to 10MB
    },
  },

  async rewrites() {
    return [
      {
        source: '/api/aitopia/:path*',
        destination: 'https://extensions.aitopia.ai/:path*',
      },
      {
        source: '/api/sentiment/:path*',
        destination: 'http://127.0.0.1:8000/:path*',
        has: [
          {
            type: 'header',
            key: 'content-type',
            value: '(.*?)',
          },
        ],
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      {
        source: '/api/aitopia/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      {
        source: '/api/sentiment/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      {
  source: '/(.*)',
  headers: [
    {
      key: 'Content-Security-Policy',
      value: `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: blob:;
        connect-src 'self' http://localhost:8000 https://extensions.aitopia.ai;
        frame-src https://drive.google.com;
      `.replace(/\n/g, ' ').trim()
    }
  ],
}


    ];
  },
};

export default nextConfig;
