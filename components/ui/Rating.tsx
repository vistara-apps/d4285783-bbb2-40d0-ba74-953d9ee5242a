'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function Rating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className = '',
}: RatingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= rating;
          const isHalfFilled = starRating - 0.5 <= rating && starRating > rating;

          return (
            <button
              key={index}
              type="button"
              className={cn(
                'transition-colors duration-200',
                interactive && 'hover:scale-110 cursor-pointer',
                !interactive && 'cursor-default'
              )}
              onClick={() => handleStarClick(starRating)}
              disabled={!interactive}
            >
              <Star
                className={cn(
                  sizes[size],
                  isFilled || isHalfFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-400'
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-text-secondary ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}
