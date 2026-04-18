import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div
      className={`rounded-lg border border-sandy-beige bg-white p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
