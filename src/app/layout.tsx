import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import { ServiceWorkerRegister, mobileMetadata, mobileViewport } from "@/mobile";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...mobileMetadata, // 모바일 웹앱(홈 화면 추가) 설정 — src/mobile
  title: { default: "관리 시스템", template: "%s | 관리 시스템" },
  description: "관리 시스템",
};

export const viewport: Viewport = mobileViewport;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
