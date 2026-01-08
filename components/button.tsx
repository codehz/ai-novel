import { getButtonClasses, type ButtonSize, type ButtonVariant } from "@/src/lib/button-styles";
import { Loader2 } from "lucide-react";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  children: React.ReactNode;
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
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading = false, loadingText, className = "", disabled, children, ...props },
    ref,
  ) => {
    const baseClasses = getButtonClasses(variant, size);
    const finalClasses = [baseClasses, className].filter(Boolean).join(" ");

    return (
      <button ref={ref} disabled={loading || disabled} className={finalClasses} {...props}>
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
  },
);

Button.displayName = "Button";
