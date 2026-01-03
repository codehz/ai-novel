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
      userTemplate: "请根据以下种子想法生成扩展情节：{{idea}}",
    },
  },
];

export function getToolConfig(toolId: string): ToolConfig | undefined {
  return TOOLS_CONFIG.find((t) => t.id === toolId);
}

export function getAllTools(): ToolConfig[] {
  return TOOLS_CONFIG;
}
