import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink placeholder:text-warm-taupe focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30 disabled:bg-library-mist/60 ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';
