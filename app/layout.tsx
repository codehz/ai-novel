import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { ThemeToggle } from "./components/theme-toggle";
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
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="border-b border-border dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50 transition-colors">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
              >
                AI Novel
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  首页
                </Link>
                <Link
                  href="/models"
                  className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  模型配置
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
          <footer className="border-t border-border dark:border-zinc-700 py-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
            &copy; {new Date().getFullYear()} AI Novel. All rights reserved.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
