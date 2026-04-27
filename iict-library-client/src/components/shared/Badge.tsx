import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'info' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const styles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-800',
  info: 'bg-library-mist text-library-ink',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
};

export const Badge = ({ children, variant = 'info' }: BadgeProps) => {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${styles[variant]}`}>{children}</span>;
};
