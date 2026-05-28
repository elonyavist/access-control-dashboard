import type { ReactNode } from 'react';

interface EmptyViewProps {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  variant?: 'default' | 'error';
}

export function EmptyView({
  icon,
  title,
  action,
  variant = 'default',
}: EmptyViewProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <p className="text-sm font-medium">{title}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
