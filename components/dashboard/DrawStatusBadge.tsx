import { cn } from '@/utils/cn';

interface DrawStatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  SALE_OPEN: 'bg-green-100 text-green-800',
  SALE_CLOSED: 'bg-yellow-100 text-yellow-800',
  DRAWING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-indigo-100 text-indigo-800',
};

const statusLabels: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  SALE_OPEN: 'Sale Open',
  SALE_CLOSED: 'Sale Closed',
  DRAWING: 'Drawing',
  COMPLETED: 'Completed',
};

export function DrawStatusBadge({ status }: DrawStatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  const label = statusLabels[status] || status;
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      colorClass
    )}>
      {label}
    </span>
  );
}