'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { APP_CONFIG } from '@/lib/constants';
import { BookOpen, Users, Star, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onExploreTutors?: () => void;
}

export function HeroSection({ onGetStarted, onExploreTutors }: HeroSectionProps) {
  const stats = [
    { label: 'Active Tutors', value: '500+', icon: Users },
    { label: 'Study Groups', value: '1,200+', icon: BookOpen },
    { label: 'Avg Rating', value: '4.8', icon: Star },
    { label: 'Success Rate', value: '95%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Content */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Create and Join{' '}
            <span className="text-gradient">niche community</span>{' '}
            for students
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {APP_CONFIG.tagline}. Connect with verified peer tutors and curated study resources.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            className="text-lg px-8 py-4"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onExploreTutors}
            className="text-lg px-8 py-4"
          >
            Explore Tutors
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="metric-card text-center">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Cards Preview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="feature-card p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">
                Verified Tutors
              </h3>
            </div>
            <p className="text-text-secondary">
              Connect with vetted upperclassmen and peers for personalized tutoring sessions.
            </p>
          </div>
        </Card>

        <Card className="feature-card p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">
                Study Groups
              </h3>
            </div>
            <p className="text-text-secondary">
              Join or create hyper-specific study groups based on your courses and topics.
            </p>
          </div>
        </Card>

        <Card className="feature-card p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Star className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">
                Quality Resources
              </h3>
            </div>
            <p className="text-text-secondary">
              Access community-vetted study materials, notes, and practice tests.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
