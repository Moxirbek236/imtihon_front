import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://seven-oy-crm-backned-1.onrender.com/api/v1",
  },
  // API so'rovlari uchun Next.js'ni proxy qilmaymiz, frontend to'g'ridan-to'g'ri backend'ga murojaat qiladi
  // CORS backend tomonida hal qilingan
};

export default nextConfig;