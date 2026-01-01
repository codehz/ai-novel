import type { Metadata } from "next";
import Link from "next/link";
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
        <header className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              AI Novel
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors">
                首页
              </Link>
              <Link href="/models" className="text-sm font-medium hover:text-blue-600 transition-colors">
                模型配置
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <footer className="border-t py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} AI Novel. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
