/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['zbiwmgtvxlurqyfrzjhd.supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  output: 'standalone', // For Docker builds
}

module.exports = nextConfig

