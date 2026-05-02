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
    'border-library-ink bg-library-ink text-pale-cream hover:bg-library-forest',
  secondary:
    'border-library-ink bg-library-mist text-library-ink hover:bg-pale-cream',
  ghost:
    'border-library-ink bg-pale-cream text-library-ink hover:bg-library-mist',
  outline:
    'border-library-ink bg-paper-soft text-library-ink hover:bg-library-mist',
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
      className={`inline-flex max-w-full items-center justify-center border-2 text-center font-extrabold uppercase leading-snug tracking-[0.08em] shadow-[4px_4px_0_#1a1c1a] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-library-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-pale-cream disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
