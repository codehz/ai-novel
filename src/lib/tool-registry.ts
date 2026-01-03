import { ToolConfig } from "./tool-types";

export const TOOLS_CONFIG: ToolConfig[] = [
  {
    id: "seed-expander",
    name: "种子想法扩展",
    description: "给AI一个简短的“种子”，生成10-20个不同的情节方向、冲突点或结局变体。",
    icon: "Sparkles",
    version: "1.0.0",
    inputSchema: {
      submitLabel: "生成扩展想法",
      fields: [
        {
          name: "idea",
          label: "种子想法",
          type: "textarea",
          placeholder: "输入一个简短的想法，例如：一个失去记忆的侦探在未来城市追查自己...",
          required: true,
          minLength: 5,
          maxLength: 200,
          description: "输入 5-200 个字符",
        },
      ],
    },
    outputSchema: {
      type: "card-list",
      titleField: "title",
      descriptionField: "description",
      categoryField: "category",
      categories: {
        plot_direction: {
          label: "情节方向",
          icon: "MapPin",
          color: "text-blue-500 bg-blue-500/10",
        },
        conflict: {
          label: "冲突点",
          icon: "Zap",
          color: "text-amber-500 bg-amber-500/10",
        },
        ending_variant: {
          label: "结局变体",
          icon: "Flag",
          color: "text-purple-500 bg-purple-500/10",
        },
      },
    },
    prompts: {
      systemTemplate:
        "你是一个专业的创意写作助手，擅长发散思维和情节构建。请根据用户提供的种子想法，生成多个具有深度和吸引力的情节扩展方向。你的输出必须是纯 JSON 数组格式，不要包含任何解释性文字或 Markdown 标签。",
      userTemplate:
        "请根据以下种子想法生成 10 个不同的情节扩展方向、冲突点或结局变体：\n\n{{idea}}\n\n要求：\n1. 返回一个 JSON 数组，每个对象包含 title (简短标题), description (详细描述), category (分类)。\n2. category 必须是 plot_direction (情节方向), conflict (冲突点), ending_variant (结局变体) 之一。\n3. 描述应富有想象力，字数在 50-100 字之间。",
    },
  },
];

export function getToolConfig(toolId: string): ToolConfig | undefined {
  return TOOLS_CONFIG.find((t) => t.id === toolId);
}

export function getAllTools(): ToolConfig[] {
  return TOOLS_CONFIG;
}
