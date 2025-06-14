/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'ggpevhcskkaytececkbp.supabase.co', // Supabase storage domain
    ],
  },
}

module.exports = nextConfig