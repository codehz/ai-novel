import { formatDateToLocaleString } from "@/components/lib/format";
import { getWorld } from "@workflow/core/runtime";
import { clsx } from "clsx";
import { BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function StatsPage() {
  const world = getWorld();

  // 获取所有工作流运行
  const runsResponse = await world.runs.list({});
  const runs = runsResponse.data || [];

  // 计算统计数据
  const totalRuns = runs.length;
  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const failedRuns = runs.filter((r) => r.status === "failed").length;
  const runningRuns = runs.filter((r) => r.status === "running").length;
  const pausedRuns = runs.filter((r) => r.status === "paused").length;
  const cancelledRuns = runs.filter((r) => r.status === "cancelled").length;
  const pendingRuns = runs.filter((r) => r.status === "pending").length;

  // 计算成功率
  const successRate =
    completedRuns + failedRuns > 0 ? ((completedRuns / (completedRuns + failedRuns)) * 100).toFixed(1) : "0";

  // 计算平均执行耗时
  const completedWithDuration = runs.filter((r) => r.status === "completed" && r.startedAt && r.completedAt);
  const avgDurationMs =
    completedWithDuration.length > 0
      ? (
          completedWithDuration.reduce((sum, r) => {
            const start = new Date(r.startedAt!).getTime();
            const end = new Date(r.completedAt!).getTime();
            return sum + (end - start);
          }, 0) / completedWithDuration.length
        ).toFixed(0)
      : 0;

  // 格式化时间
  const formatDuration = (ms: number | string) => {
    const num = typeof ms === "string" ? parseInt(ms) : ms;
    if (num < 1000) return `${num}ms`;
    if (num < 60000) return `${(num / 1000).toFixed(1)}s`;
    return `${(num / 60000).toFixed(1)}m`;
  };

  // 最近 7 天的趋势数据
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const trendData: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    });
    trendData[dateStr] = 0;
  }

  // 统计最近 7 天的运行
  runs.forEach((run) => {
    const runDate = new Date(run.createdAt);
    if (runDate >= sevenDaysAgo) {
      const dateStr = runDate.toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
      });
      if (dateStr in trendData) {
        trendData[dateStr]++;
      }
    }
  });

  // 获取最大值用于归一化
  const maxTrendValue = Math.max(...Object.values(trendData), 1);

  // 创建简单的 ASCII 柱状图
  const renderTrendBar = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    const bars = Math.ceil((percentage / 100) * 10);
    const barChars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    return barChars[Math.min(bars - 1, barChars.length - 1)] || "▁";
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">工作流统计仪表板</h1>
        <p className="text-muted-foreground">查看工作流运行的统计数据和趋势分析。</p>
      </div>

      {/* 顶部指标卡片 */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">关键指标</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 总运行数 */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">总运行数</p>
            <p className="text-3xl font-bold">{totalRuns}</p>
          </div>

          {/* 成功数 */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">成功数</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedRuns}</p>
          </div>

          {/* 失败数 */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">失败数</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{failedRuns}</p>
          </div>

          {/* 成功率 */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">成功率</p>
            <p className="text-3xl font-bold text-primary">{successRate}%</p>
            {/* 进度条表示 */}
            <div className="mt-2 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full transition-all" style={{ width: `${successRate}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* 第二行指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 平均耗时 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">平均执行耗时</p>
          <p className="text-2xl font-bold">{formatDuration(avgDurationMs as string)}</p>
          <p className="text-xs text-muted-foreground mt-2">基于 {completedWithDuration.length} 个已完成的运行</p>
        </div>

        {/* 运行中的工作流 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">当前活跃运行</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{runningRuns}</p>
          <p className="text-xs text-muted-foreground mt-2">
            运行中: {runningRuns}, 暂停: {pausedRuns}, 等待: {pendingRuns}
          </p>
        </div>
      </div>

      {/* 状态分布 */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">状态分布</h2>
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 饼图样式的卡片 */}
            <div className="space-y-4">
              <h3 className="font-medium mb-4">运行状态统计</h3>
              {[
                { label: "已完成", value: completedRuns, color: "bg-green-500" },
                { label: "失败", value: failedRuns, color: "bg-red-500" },
                { label: "运行中", value: runningRuns, color: "bg-blue-500" },
                { label: "已暂停", value: pausedRuns, color: "bg-gray-500" },
                { label: "已取消", value: cancelledRuns, color: "bg-orange-500" },
                { label: "等待中", value: pendingRuns, color: "bg-amber-500" },
              ]
                .filter((item) => item.value > 0)
                .map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={clsx("w-3 h-3 rounded-full", item.color)}></div>
                    <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                    <span className="font-mono font-medium">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((item.value / totalRuns) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
            </div>

            {/* 横向柱状图 */}
            <div className="space-y-4">
              <h3 className="font-medium mb-4">状态分布柱状图</h3>
              {[
                {
                  label: "已完成",
                  value: completedRuns,
                  color: "bg-green-500",
                },
                { label: "失败", value: failedRuns, color: "bg-red-500" },
                { label: "运行中", value: runningRuns, color: "bg-blue-500" },
                { label: "已暂停", value: pausedRuns, color: "bg-gray-500" },
                { label: "已取消", value: cancelledRuns, color: "bg-orange-500" },
                { label: "等待中", value: pendingRuns, color: "bg-amber-500" },
              ]
                .filter((item) => item.value > 0)
                .map((item) => (
                  <div key={`bar-${item.label}`} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">{item.label}</span>
                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                      <div
                        className={clsx(item.color, "h-full transition-all")}
                        style={{
                          width: `${totalRuns > 0 ? (item.value / totalRuns) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="font-mono text-sm font-medium w-8 text-right">{item.value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* 近期运行趋势 */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">最近 7 天运行趋势</h2>
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="space-y-3">
            {Object.entries(trendData)
              .reverse()
              .map(([date, count]) => (
                <div key={date} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-12">{date}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-mono text-2xl">{renderTrendBar(count, maxTrendValue)}</span>
                    <span className="font-mono text-sm">{count} 次</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* 快速链接 */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">快速链接</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/workflows"
            className="p-6 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all hover:shadow-md group"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-semibold">查看所有运行</span>
            </div>
            <p className="text-sm text-muted-foreground">浏览完整的工作流运行列表</p>
          </Link>

          <Link
            href="/logs"
            className="p-6 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all hover:shadow-md group"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-semibold">查看模型日志</span>
            </div>
            <p className="text-sm text-muted-foreground">查看所有的模型调用日志和成本统计</p>
          </Link>
        </div>
      </section>

      {/* 页面更新时间 */}
      <section className="text-center text-xs text-muted-foreground">
        <p>数据更新于: {formatDateToLocaleString(new Date())}</p>
      </section>
    </div>
  );
}
