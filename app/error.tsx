'use client';

import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">
            Something went wrong!
          </h2>
          <p className="text-text-secondary">
            We encountered an error while loading EduNiche. Please try again.
          </p>
        </div>
        <Button onClick={reset} variant="primary">
          Try Again
        </Button>
      </div>
    </div>
  );
}
