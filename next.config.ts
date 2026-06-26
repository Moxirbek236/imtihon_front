import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel'da deploy qilinganda barcha routelarni index.html ga yo'naltirish
  // Bu Next.js app router bilan SPA-like navigation imkonini beradi
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/",
      },
    ];
  },
  // API so'rovlari uchun Next.js'ni proxy qilmaymiz, frontend to'g'ridan-to'g'ri backend'ga murojaat qiladi
  // CORS backend tomonida hal qilingan
};

export default nextConfig;