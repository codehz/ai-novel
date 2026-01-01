/**
 * 项目中使用的颜色变量名常量
 * 对应 app/globals.css 中的 CSS 变量
 */
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
