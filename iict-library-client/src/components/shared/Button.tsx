import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-library-forest to-library-gold text-white shadow-[0_10px_20px_rgba(58,90,64,0.25)] hover:brightness-110',
  secondary:
    'bg-library-mist text-library-ink border border-sandy-beige shadow-sm hover:bg-white',
  ghost:
    'bg-transparent text-library-ink hover:bg-library-mist',
  outline:
    'bg-white text-library-ink border border-sandy-beige shadow-sm hover:bg-library-mist',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-xs',
  md: 'min-h-10 px-4 py-2 text-sm',
};

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`inline-flex max-w-full items-center justify-center rounded-full text-center font-semibold leading-snug tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-library-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-pale-cream disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
