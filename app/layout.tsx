import { OverlayQueue } from "@/components/overlay";
import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { ResponsiveNav } from "../components/responsive-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Novel",
  description: "AI 小说生成器",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen flex flex-col">
        <OverlayQueue>
          <header className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50 transition-colors">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
                AI Novel
              </Link>
              <ResponsiveNav>
                <Link
                  href="/"
                  className="text-sm font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted md:hover:bg-transparent"
                >
                  首页
                </Link>
                <Link
                  href="/models"
                  className="text-sm font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted md:hover:bg-transparent"
                >
                  模型配置
                </Link>
                <Link
                  href="/logs"
                  className="text-sm font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted md:hover:bg-transparent"
                >
                  调用日志
                </Link>
                <Link
                  href="/tools"
                  className="text-sm font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted md:hover:bg-transparent"
                >
                  工具箱
                </Link>
              </ResponsiveNav>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            <ViewTransition>{children}</ViewTransition>
          </main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground transition-colors">
            &copy; {new Date().getFullYear()} AI Novel. All rights reserved.
          </footer>
        </OverlayQueue>
      </body>
    </html>
  );
}
