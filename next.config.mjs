/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Enable compression
  compress: true,
  
  // Optimize production builds
  swcMinify: true,
  
  // Experimental features for better performance
  // experimental: {
  //   optimizeCss: true, // Disabled for Vercel deployment compatibility
  // },
}

export default nextConfig

