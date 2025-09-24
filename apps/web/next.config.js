/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    domains: ['images.unsplash.com', 'unsplash.com'],
  },
}

module.exports = nextConfig