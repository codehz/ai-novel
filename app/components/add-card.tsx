import { Plus } from "lucide-react";

interface AddCardProps {
  onClick: () => void;
  label: string;
}

export function AddCard({ onClick, label }: AddCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group text-muted-foreground hover:text-primary h-full min-h-30"
    >
      <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
