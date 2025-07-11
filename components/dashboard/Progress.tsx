import { cn } from "@/utils/cn";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export function Progress({ value, max = 100, className }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2.5", className)}>
      <div 
        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}