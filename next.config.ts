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
      bodySizeLimit: '30mb' // Increase the body size limit to 30MB
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
      destination: `${process.env.SA_MODEL_LINK || 'http://127.0.0.1:8000'}/:path*`,
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
              script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net;
              worker-src 'self' blob: data:;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https://*.googleusercontent.com https://*.pixabay.com https://*.cloudinary.com https://*.vercel-storage.com https://*.unsplash.com https://drive.google.com https://letsenhance.io;
              media-src 'self' blob:;
              connect-src 'self' ${process.env.SA_MODEL_LINK || 'http://localhost:8000'} https://extensions.aitopia.ai https://cdn.jsdelivr.net https://tessdata.projectnaptha.com;
              frame-src https://drive.google.com;
            `.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ];
  },
};

export default nextConfig;