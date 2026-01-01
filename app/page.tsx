import { Settings } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Novel
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          下一代 AI 小说创作平台。利用最先进的大语言模型，开启您的创作之旅。
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/write"
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            开始创作
          </Link>
          <Link
            href="/models"
            className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-bold text-lg hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-2"
          >
            <Settings size={20} />
            配置模型
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-left">
          <h3 className="text-lg font-bold text-blue-900 mb-2">多模型支持</h3>
          <p className="text-blue-800/70 text-sm">支持 OpenAI, Anthropic, Gemini 等多种主流模型，随心切换。</p>
        </div>
        <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100 text-left">
          <h3 className="text-lg font-bold text-purple-900 mb-2">智能续写</h3>
          <p className="text-purple-800/70 text-sm">基于上下文深度理解，为您提供连贯、精彩的剧情建议。</p>
        </div>
        <div className="p-6 rounded-2xl bg-pink-50 border border-pink-100 text-left">
          <h3 className="text-lg font-bold text-pink-900 mb-2">完全掌控</h3>
          <p className="text-pink-800/70 text-sm">自定义模型参数，精准控制创作风格与字数。</p>
        </div>
      </div>
    </div>
  );
}
