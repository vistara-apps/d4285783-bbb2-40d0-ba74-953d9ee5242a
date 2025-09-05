'use client';

import { cn } from '@/lib/utils';
import { type InputProps } from '@/lib/types';

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  error,
  className = '',
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn(
          'input-field w-full',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
