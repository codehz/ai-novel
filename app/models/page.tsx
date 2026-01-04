import { getProviders } from "@/src/actions/models";
import { ModelList } from "./_components/model-list";
import { ProviderList } from "./_components/provider-list";

export default async function ModelsPage() {
  const providers = await getProviders();

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">模型配置</h1>
            <p className="text-muted-foreground mt-1">管理 AI 模型提供商及其具体的模型参数。</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">模型提供商</h2>
        </div>
        <ProviderList initialProviders={providers} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">模型列表</h2>
        </div>
        <ModelList initialProviders={providers} />
      </section>
    </div>
  );
}
