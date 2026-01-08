import { getButtonClasses, type ButtonSize, type ButtonVariant } from "@/src/lib/button-styles";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { ComponentProps } from "react";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
}

/**
 * 通用按钮组件
 * 支持多种样式变体和大小
 *
 * @example
 * <Button variant="primary" size="md">保存</Button>
 * <Button variant="destructive" size="sm">删除</Button>
 * <Button loading loadingText="加载中...">提交</Button>
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  className = "",
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  const baseClasses = getButtonClasses(variant, size);
  const finalClasses = clsx(baseClasses, className);

  return (
    <button ref={ref} disabled={loading || disabled} className={finalClasses} type="button" {...props}>
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
