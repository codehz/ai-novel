import { Icon } from "@/components/icon";
import { Wrench } from "lucide-react";

export function ToolIcon({ name, className }: { name?: string | null; className?: string }) {
  return <Icon iconName={name} defaultIcon={Wrench} className={className} />;
}
