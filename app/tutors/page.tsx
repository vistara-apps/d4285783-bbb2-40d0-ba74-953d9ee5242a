'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { TutorCard } from '@/components/features/TutorCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useTutorsStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { TutorProfile, User } from '@/lib/types';
import { Search, Filter, Star, DollarSign, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const COURSES = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Economics',
  'Statistics',
  'Psychology',
  'History',
];

const SPECIALTIES = [
  'Algorithms',
  'Data Structures',
  'Machine Learning',
  'Web Development',
  'Calculus',
  'Linear Algebra',
  'Quantum Physics',
  'Organic Chemistry',
  'Molecular Biology',
  'Microeconomics',
];

export default function TutorsPage() {
  const { authenticated } = useAuth();
  const { filters, setFilters, clearFilters } = useTutorsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch tutors with filters
  const { data: tutors, isLoading, error, refetch } = useQuery({
    queryKey: ['tutors', filters, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.course) params.append('course', filters.course);
      if (filters.minRating > 0) params.append('minRating', filters.minRating.toString());
      if (filters.maxRate < 1000) params.append('maxRate', filters.maxRate.toString());
      params.append('verified', 'true');
      params.append('limit', '20');

      const response = await fetch(`/api/tutors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tutors');
      const result = await response.json();
      return result.data as (TutorProfile & { user: User })[];
    },
  });

  // Filter tutors by search query
  const filteredTutors = tutors?.filter(tutor => 
    tutor.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.courses.some(course => course.toLowerCase().includes(searchQuery.toLowerCase())) ||
    tutor.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleBookSession = async (tutorId: string) => {
    if (!authenticated) {
      toast.error('Please sign in to book a session');
      return;
    }
    
    // Navigate to booking page
    window.location.href = `/book/${tutorId}`;
  };

  const handleViewProfile = (tutorId: string) => {
    window.location.href = `/tutors/${tutorId}`;
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const currentSpecialties = filters.specialties || [];
    const newSpecialties = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter(s => s !== specialty)
      : [...currentSpecialties, specialty];
    setFilters({ specialties: newSpecialties });
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-text-primary">
            Find Your Perfect Tutor
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Connect with verified peer tutors who excel in their subjects and are ready to help you succeed.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
              <Input
                placeholder="Search tutors, subjects, or specialties..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-surface">
              {/* Course Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Course</label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                  className="w-full p-2 rounded-md bg-surface border border-surface text-text-primary"
                >
                  <option value="">All Courses</option>
                  {COURSES.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                  className="w-full p-2 rounded-md bg-surface border border-surface text-text-primary"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4.0}>4.0+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={4.8}>4.8+ Stars</option>
                </select>
              </div>

              {/* Rate Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Max Rate (USDC/30min)</label>
                <select
                  value={filters.maxRate}
                  onChange={(e) => handleFilterChange('maxRate', parseFloat(e.target.value))}
                  className="w-full p-2 rounded-md bg-surface border border-surface text-text-primary"
                >
                  <option value={1000}>Any Rate</option>
                  <option value={20}>Under $20</option>
                  <option value={30}>Under $30</option>
                  <option value={50}>Under $50</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Specialties Filter */}
          {showFilters && (
            <div className="space-y-2 pt-4 border-t border-surface">
              <label className="text-sm font-medium text-text-primary">Specialties</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(specialty => (
                  <Badge
                    key={specialty}
                    variant={filters.specialties?.includes(specialty) ? 'primary' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => handleSpecialtyToggle(specialty)}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">
              {isLoading ? 'Loading...' : `${filteredTutors.length} Tutors Found`}
            </h2>
            {!authenticated && (
              <div className="text-sm text-text-secondary">
                <Button variant="primary" size="sm">
                  Sign In to Book Sessions
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Card className="p-6 text-center">
              <p className="text-red-400">Failed to load tutors. Please try again.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4">
                Retry
              </Button>
            </Card>
          )}

          {isLoading ? (
            <div className="grid gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-surface rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface rounded w-1/3"></div>
                      <div className="h-3 bg-surface rounded w-1/2"></div>
                      <div className="h-3 bg-surface rounded w-2/3"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredTutors.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No tutors found
              </h3>
              <p className="text-text-secondary mb-4">
                Try adjusting your search criteria or filters to find more tutors.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredTutors.map((tutor) => (
                <TutorCard
                  key={tutor.userId}
                  tutor={tutor}
                  onBookSession={handleBookSession}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <Card className="p-8 text-center bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            Want to become a tutor?
          </h3>
          <p className="text-text-secondary mb-6">
            Share your knowledge, help fellow students, and earn USDC by becoming a verified tutor on EduNiche.
          </p>
          <Button variant="primary" size="lg">
            Apply to Become a Tutor
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
