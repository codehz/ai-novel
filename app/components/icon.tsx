/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

export function Icon({
  iconName,
  defaultIcon,
  className,
}: {
  iconName?: string;
  defaultIcon?: LucideIcon;
  className?: string;
}) {
  const IconComponent = (iconName && (Icons as any)[iconName]) || defaultIcon || Icons.HelpCircle;
  return <IconComponent className={className} />;
}
