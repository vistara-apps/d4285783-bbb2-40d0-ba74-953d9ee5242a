'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { formatCurrency } from '@/lib/utils';
import { type TutorProfile, type User } from '@/lib/types';
import { Clock, Star, BookOpen } from 'lucide-react';

interface TutorCardProps {
  tutor: TutorProfile & { user: User };
  onBookSession?: (tutorId: string) => void;
  onViewProfile?: (tutorId: string) => void;
}

export function TutorCard({ tutor, onBookSession, onViewProfile }: TutorCardProps) {
  return (
    <Card className="feature-card">
      <CardContent>
        <div className="flex items-start space-x-4">
          <Avatar
            src={tutor.user.avatar}
            name={tutor.user.displayName}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-text-primary truncate">
                {tutor.user.displayName}
              </h3>
              {tutor.verified && (
                <Badge variant="success" size="sm">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-text-secondary text-sm mt-1 line-clamp-2">
              {tutor.bio}
            </p>
            
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-1">
                <Rating rating={tutor.ratings} size="sm" showValue />
              </div>
              <div className="flex items-center space-x-1 text-text-secondary text-sm">
                <Clock className="w-4 h-4" />
                <span>{tutor.totalSessions} sessions</span>
              </div>
            </div>

            <div className="flex items-center space-x-1 mt-2">
              <BookOpen className="w-4 h-4 text-text-secondary" />
              <div className="flex flex-wrap gap-1">
                {tutor.courses.slice(0, 2).map((course) => (
                  <Badge key={course} variant="primary" size="sm">
                    {course}
                  </Badge>
                ))}
                {tutor.courses.length > 2 && (
                  <Badge variant="default" size="sm">
                    +{tutor.courses.length - 2} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-3">
              <p className="text-lg font-semibold text-accent">
                {formatCurrency(tutor.rates)}/30min
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex space-x-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile?.(tutor.userId)}
            className="flex-1"
          >
            View Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onBookSession?.(tutor.userId)}
            className="flex-1"
          >
            Book Session
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
