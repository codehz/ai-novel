import { getIconButtonClasses, type ButtonColor, type IconButtonShape } from "@/src/lib/button-styles";
import clsx from "clsx";
import { ComponentProps } from "react";

interface IconButtonProps extends ComponentProps<"button"> {
  color?: ButtonColor;
  shape?: IconButtonShape;
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
export function IconButton({
  color = "default",
  shape = "round",
  className = "",
  children,
  ref,
  ...props
}: IconButtonProps) {
  const baseClasses = getIconButtonClasses(color, shape);
  const finalClasses = clsx(baseClasses, className);

  return (
    <button ref={ref} className={finalClasses} type="button" {...props}>
      {children}
    </button>
  );
}
