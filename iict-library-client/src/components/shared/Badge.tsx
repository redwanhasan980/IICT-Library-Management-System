import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'info' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const styles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700',
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
};

export const Badge = ({ children, variant = 'info' }: BadgeProps) => {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[variant]}`}>{children}</span>;
};
