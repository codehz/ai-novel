import { OverlayQueue } from "@/components/overlay";
import { ResponsiveNav, type NavItem } from "@/components/responsive-nav";
import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
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
  const navItems: NavItem[] = [
    { label: "首页", href: "/" },
    { label: "模型配置", href: "/models" },
    { label: "工具箱", href: "/tools" },
    {
      label: "日志",
      children: [
        { label: "调用日志", href: "/logs" },
        { label: "工作流", href: "/workflows" },
      ],
    },
  ];

  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen flex flex-col">
        <OverlayQueue>
          <header className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50 transition-colors">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
                AI Novel
              </Link>
              <ResponsiveNav items={navItems} />
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
