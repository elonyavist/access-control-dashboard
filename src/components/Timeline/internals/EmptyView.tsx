import { CalendarOff } from 'lucide-react';

interface EmptyViewProps {
  message: string;
}

export function EmptyView({ message }: EmptyViewProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <CalendarOff className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}