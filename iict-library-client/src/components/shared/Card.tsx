import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div
      className={`border-2 border-library-ink bg-paper-soft/95 p-5 shadow-[6px_6px_0_#1a1c1a] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
