/**
 * 按钮样式常量库
 * 支持多种 variant 和 size 组合
 */

export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost" | "outline" | "link" | "destructive-link";
export type ButtonSize = "sm" | "md" | "lg" | "xs";
export type ButtonColor = "default" | "primary" | "success" | "destructive" | "warning";
export type IconButtonShape = "round" | "square";

/**
 * 按钮基础样式
 */
const baseStyles =
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * 按钮 variant 样式映射
 */
export const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
  ghost: "hover:bg-muted text-foreground focus-visible:ring-primary",
  outline: "border border-border bg-background text-foreground hover:bg-muted focus-visible:ring-primary",
  link: "text-primary hover:underline bg-transparent !p-0 !h-auto focus-visible:ring-primary",
  "destructive-link": "text-destructive hover:underline bg-transparent !p-0 !h-auto focus-visible:ring-destructive",
};

/**
 * 按钮尺寸样式映射
 */
export const buttonSizeStyles: Record<ButtonSize, string> = {
  xs: "h-7 px-2 rounded-md text-[10px]",
  sm: "h-8 px-3 rounded-md text-xs",
  md: "h-10 px-4 rounded-lg text-sm",
  lg: "h-12 px-6 rounded-lg text-base",
};

/**
 * 获取按钮的完整样式类
 * @param variant - 按钮风格
 * @param size - 按钮大小
 * @returns 合并后的 CSS 类名
 */
export function getButtonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return [baseStyles, buttonVariantStyles[variant], buttonSizeStyles[size]].filter(Boolean).join(" ");
}

/**
 * IconButton 的颜色样式映射
 */
export const iconButtonColorStyles: Record<ButtonColor, string> = {
  default: "text-foreground hover:bg-muted",
  primary: "text-primary hover:bg-primary/10",
  success: "text-success hover:bg-success/10",
  destructive: "text-destructive hover:bg-destructive/10",
  warning: "text-warning hover:bg-warning/10",
};

/**
 * IconButton 的形状样式映射
 */
export const iconButtonShapeStyles: Record<IconButtonShape, string> = {
  round: "rounded-full",
  square: "rounded-lg",
};

/**
 * 获取 IconButton 的完整样式类
 * @param color - 图标按钮颜色
 * @param shape - 图标按钮形状
 * @returns 合并后的 CSS 类名
 */
export function getIconButtonClasses(color: ButtonColor = "default", shape: IconButtonShape = "round"): string {
  return [
    "p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    iconButtonColorStyles[color],
    iconButtonShapeStyles[shape],
  ]
    .filter(Boolean)
    .join(" ");
}
