import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`mt-1 block min-h-10 w-full min-w-0 max-w-full border-2 border-library-ink bg-paper-soft px-3 py-2 text-sm font-semibold text-library-ink placeholder:text-warm-taupe focus:outline-none focus:ring-2 focus:ring-library-forest/40 disabled:bg-library-mist/60 ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';
