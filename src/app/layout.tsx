import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"
import ClientLayout from "./ClientLayout";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Najot Edu CRM",
  description: "CRM system for Najot Edu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Toaster position="top-center" />
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
