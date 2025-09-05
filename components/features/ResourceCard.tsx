'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { formatCurrency, formatFileSize } from '@/lib/utils';
import { type Resource } from '@/lib/types';
import { Download, FileText, DollarSign } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onDownload?: (resourceId: string) => void;
  onPurchase?: (resourceId: string) => void;
  onPreview?: (resourceId: string) => void;
}

export function ResourceCard({ resource, onDownload, onPurchase, onPreview }: ResourceCardProps) {
  const isFree = resource.price === 0;

  return (
    <Card className="feature-card">
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
                {resource.title}
              </h3>
              <p className="text-text-secondary text-sm mt-1 line-clamp-2">
                {resource.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="primary" size="sm">
              {resource.course}
            </Badge>
            <Badge variant="default" size="sm">
              {resource.topic}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1">
            {resource.tags.map((tag) => (
              <Badge key={tag} variant="accent" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Rating rating={resource.ratings} size="sm" showValue />
              <div className="flex items-center space-x-1 text-text-secondary text-sm">
                <Download className="w-4 h-4" />
                <span>{resource.downloads}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">
                {resource.fileType} • {formatFileSize(resource.fileSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {isFree ? (
                <Badge variant="success" size="sm">
                  Free
                </Badge>
              ) : (
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-accent" />
                  <span className="text-lg font-semibold text-accent">
                    {formatCurrency(resource.price)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex space-x-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview?.(resource.resourceId)}
            className="flex-1"
          >
            Preview
          </Button>
          <Button
            variant={isFree ? 'accent' : 'primary'}
            size="sm"
            onClick={() => isFree ? onDownload?.(resource.resourceId) : onPurchase?.(resource.resourceId)}
            className="flex-1"
          >
            {isFree ? 'Download' : 'Purchase'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
