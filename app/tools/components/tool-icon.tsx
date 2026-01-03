/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Icons from "lucide-react";
import { Wrench } from "lucide-react";

export function ToolIcon({ name, className }: { name?: string; className?: string }) {
  const IconComponent = (name && (Icons as any)[name]) || Wrench;
  return <IconComponent className={className} />;
}
