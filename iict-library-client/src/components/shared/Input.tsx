import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className = '', ...props }: InputProps) => {
  return (
    <input
      className={`mt-1 w-full rounded-md border border-sandy-beige px-3 py-2 text-sm text-dark-brown focus:border-dark-brown focus:outline-none focus:ring-1 focus:ring-dark-brown disabled:bg-gray-100 ${className}`}
      {...props}
    />
  );
};
