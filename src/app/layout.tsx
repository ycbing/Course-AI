import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export const metadata: Metadata = {
  title: "CourseAI - AI课件/教学视频生成器",
  description: "输入主题，AI自动生成教学文案、配图、配音，一键合成教学视频和PDF课件。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
