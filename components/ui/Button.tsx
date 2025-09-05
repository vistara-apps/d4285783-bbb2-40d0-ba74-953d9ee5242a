'use client';

import { cn } from '@/lib/utils';
import { type ButtonProps } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'btn-primary focus:ring-primary/20',
    secondary: 'btn-secondary focus:ring-white/20',
    accent: 'btn-accent focus:ring-accent/20',
    outline: 'border border-white/20 text-text-primary hover:bg-white/5 focus:ring-white/20',
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-lg',
  };

  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  );
}
