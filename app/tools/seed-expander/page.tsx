import { Sparkles } from "lucide-react";
import { SeedExpander } from "../components/seed-expander/seed-expander";

export default function SeedExpanderPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">种子想法扩展</h1>
          <p className="text-muted-foreground">输入一个简短的创意种子，让 AI 为你探索无限可能。</p>
        </div>
      </div>

      <SeedExpander />
    </div>
  );
}
