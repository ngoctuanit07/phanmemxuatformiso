/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false, // Hide X-Powered-By: Next.js to prevent tech stack fingerprinting
  experimental: {
    serverComponentsExternalPackages: [
      'mysql2',
      'puppeteer-core',
      'mammoth',
      'pizzip',
      'docxtemplater',
      'docx',
      'bcryptjs'
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN' // Allows iframe previews only from the same origin
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Prevent MIME type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
