import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'info' | 'warning' | 'danger' | 'error';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  success: 'border-emerald-900 bg-emerald-100 text-emerald-950',
  info: 'border-library-ink bg-library-mist text-library-ink',
  warning: 'border-amber-950 bg-amber-100 text-amber-950',
  danger: 'border-rose-950 bg-rose-100 text-rose-950',
  error: 'border-rose-950 bg-rose-100 text-rose-950',
};

export const Badge = ({ children, variant = 'info', className = '' }: BadgeProps) => {
  return <span className={`inline-flex border px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide ${styles[variant]} ${className}`}>{children}</span>;
};
