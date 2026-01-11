/**
 * 项目中使用的颜色变量名常量
 * 对应 app/globals.css 中的 CSS 变量
 */
import type { CSSProperties } from "react";
export const COLORS = {
  // 基础背景与文字
  BACKGROUND: "var(--background)",
  FOREGROUND: "var(--foreground)",
  MUTED: "var(--muted)",
  MUTED_FOREGROUND: "var(--muted-foreground)",
  BORDER: "var(--border)",
  CARD: "var(--card)",
  CARD_FOREGROUND: "var(--card-foreground)",

  // 品牌色
  PRIMARY: "var(--primary)",
  PRIMARY_FOREGROUND: "var(--primary-foreground)",
  SECONDARY: "var(--secondary)",
  SECONDARY_FOREGROUND: "var(--secondary-foreground)",
  ACCENT: "var(--accent)",
  ACCENT_FOREGROUND: "var(--accent-foreground)",

  // 状态色
  SUCCESS: "var(--success)",
  SUCCESS_FOREGROUND: "var(--success-foreground)",
  WARNING: "var(--warning)",
  WARNING_FOREGROUND: "var(--warning-foreground)",
  DESTRUCTIVE: "var(--destructive)",
  DESTRUCTIVE_FOREGROUND: "var(--destructive-foreground)",
  INFO: "var(--info)",
  INFO_FOREGROUND: "var(--info-foreground)",

  // 交互
  INPUT: "var(--input)",
  INPUT_BORDER: "var(--input-border)",
  RING: "var(--ring)",
  HOVER_BG: "var(--hover-bg)",
} as const;

/**
 * Tailwind 类名常量，用于在 TSX 中保持一致性
 */
export const COLOR_CLASSES = {
  TEXT: {
    DEFAULT: "text-foreground",
    MUTED: "text-muted-foreground",
    PRIMARY: "text-primary",
    SECONDARY: "text-secondary",
    SUCCESS: "text-success",
    WARNING: "text-warning",
    DESTRUCTIVE: "text-destructive",
    INFO: "text-info",
  },
  BG: {
    DEFAULT: "bg-background",
    CARD: "bg-card",
    MUTED: "bg-muted",
    PRIMARY: "bg-primary",
    SECONDARY: "bg-secondary",
    SUCCESS: "bg-success",
    WARNING: "bg-warning",
    DESTRUCTIVE: "bg-destructive",
    INFO: "bg-info",
    HOVER: "hover:bg-hover-bg",
  },
  BORDER: {
    DEFAULT: "border-border",
    INPUT: "border-input-border",
    PRIMARY: "border-primary",
  },
} as const;

/**
 * 分类配置的 HSL Hue 预设值 (0-360)
 * 用于替代 Tailwind 动态类名方案
 */
export const CATEGORY_HUES = {
  PRIMARY: 210, // 蓝色
  SECONDARY: 270, // 紫色
  SUCCESS: 160, // 绿色
  WARNING: 45, // 琥珀/黄色
  DESTRUCTIVE: 0, // 红色
  INFO: 210, // 蓝色
  // 其他常见颜色
  CYAN: 187,
  TEAL: 174,
  ROSE: 340,
  PINK: 330,
  INDIGO: 243,
  VIOLET: 280,
} as const;

/**
 * 将 HSL hue 值转换为完整的 HSL 颜色字符串
 * @param hue - HSL hue 值 (0-360)
 * @param saturation - 饱和度百分比，默认为 100
 * @returns CSS 可用的 hsl() 字符串，支持浅/深色模式自动切换
 */
export function toHslColor(hue: number, saturation: number = 100): string {
  // 在浅色模式下使用较深的亮度(30%)，在深色模式下使用较亮的亮度(60%)
  // 使用 light-dark() CSS 函数自动根据系统偏好切换
  return `light-dark(hsl(${hue}, ${saturation}%, 30%), hsl(${hue}, ${saturation}%, 60%))`;
}

/**
 * 获取分类配置的样式对象
 * @param hue - HSL hue 值，默认为 PRIMARY (210)
 * @returns 包含 color 和 backgroundColor 的 React 样式对象
 */
export function getCategoryStyle(hue: number = CATEGORY_HUES.PRIMARY): CSSProperties {
  return {
    color: `light-dark(hsl(${hue}, 100%, 30%), hsl(${hue}, 100%, 60%))`,
    backgroundColor: `light-dark(hsl(${hue}, 100%, 95%), hsl(${hue}, 100%, 15%))`,
  };
}
