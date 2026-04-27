import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div
      className={`rounded-2xl border border-sandy-beige/70 bg-white/85 p-5 shadow-[0_16px_30px_rgba(22,35,28,0.12)] backdrop-blur ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
