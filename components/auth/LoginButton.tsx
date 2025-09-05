'use client';

import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/Button';
import { User, LogOut } from 'lucide-react';

interface LoginButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoginButton({ variant = 'primary', size = 'md', className }: LoginButtonProps) {
  const { isAuthenticated, isLoading, user, signIn, signOut } = useAuth();

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        Loading...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-sm font-medium text-text-primary">
            {user.displayName}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={signIn}
      className={className}
    >
      Sign In with Farcaster
    </Button>
  );
}
