'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { type StudyGroup } from '@/lib/types';
import { Users, Lock, Calendar } from 'lucide-react';

interface StudyGroupCardProps {
  group: StudyGroup;
  onJoinGroup?: (groupId: string) => void;
  onViewGroup?: (groupId: string) => void;
}

export function StudyGroupCard({ group, onJoinGroup, onViewGroup }: StudyGroupCardProps) {
  const isFull = group.members.length >= group.maxMembers;

  return (
    <Card className="feature-card">
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
              {group.name}
            </h3>
            {group.isPrivate && (
              <Lock className="w-4 h-4 text-text-secondary flex-shrink-0 ml-2" />
            )}
          </div>

          <p className="text-text-secondary text-sm line-clamp-3">
            {group.description}
          </p>

          <div className="flex items-center space-x-2">
            <Badge variant="primary" size="sm">
              {group.course}
            </Badge>
            <Badge variant="default" size="sm">
              {group.topic}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1">
            {group.tags.map((tag) => (
              <Badge key={tag} variant="accent" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-text-secondary">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>
                {group.members.length}/{group.maxMembers} members
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(group.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex space-x-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewGroup?.(group.groupId)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onJoinGroup?.(group.groupId)}
            disabled={isFull}
            className="flex-1"
          >
            {isFull ? 'Full' : 'Join Group'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
