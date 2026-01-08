import { getIconButtonClasses, type ButtonColor, type IconButtonShape } from "@/src/lib/button-styles";
import clsx from "clsx";
import React from "react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColor;
  shape?: IconButtonShape;
  className?: string;
  children: React.ReactNode;
}

/**
 * 图标按钮组件
 * 用于展示仅包含图标的小按钮
 *
 * @example
 * <IconButton color="primary" shape="round">
 *   <Edit2 size={14} />
 * </IconButton>
 * <IconButton color="destructive" shape="square">
 *   <Trash2 size={16} />
 * </IconButton>
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ color = "default", shape = "round", className = "", children, ...props }, ref) => {
    const baseClasses = getIconButtonClasses(color, shape);
    const finalClasses = clsx(baseClasses, className);

    return (
      <button ref={ref} className={finalClasses} type="button" {...props}>
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
