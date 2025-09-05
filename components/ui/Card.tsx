'use client';

import { cn } from '@/lib/utils';
import { type CardProps } from '@/lib/types';

export function Card({ className = '', children, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card animate-fade-in',
        onClick && 'cursor-pointer hover:scale-105 transition-transform duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('p-6 pb-4', className)}>
      {children}
    </div>
  );
}

export function CardContent({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('p-6 pt-4 border-t border-white/10', className)}>
      {children}
    </div>
  );
}
