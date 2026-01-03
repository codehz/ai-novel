/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sparkles, Wrench } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Sparkles: Sparkles,
  default: Wrench,
};

export function ToolIcon({ name, className }: { name?: string; className?: string }) {
  const IconComponent = (name && ICON_MAP[name]) || ICON_MAP.default;
  return <IconComponent className={className} />;
}
