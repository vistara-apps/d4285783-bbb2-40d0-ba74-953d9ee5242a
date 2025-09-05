'use client';

import { useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { AppShell } from '@/components/layout/AppShell';
import { HeroSection } from '@/components/features/HeroSection';
import { TutorCard } from '@/components/features/TutorCard';
import { StudyGroupCard } from '@/components/features/StudyGroupCard';
import { ResourceCard } from '@/components/features/ResourceCard';
import { Button } from '@/components/ui/Button';
import { type TutorProfile, type User, type StudyGroup, type Resource } from '@/lib/types';

// Mock data for demonstration
const mockTutors: (TutorProfile & { user: User })[] = [
  {
    userId: '1',
    courses: ['Computer Science', 'Mathematics'],
    rates: 25,
    availability: [],
    ratings: 4.8,
    totalSessions: 45,
    bio: 'CS senior with expertise in algorithms and data structures. Helped 40+ students improve their grades.',
    verified: true,
    specialties: ['Algorithms', 'Data Structures'],
    user: {
      userId: '1',
      displayName: 'Alex Chen',
      bio: 'Computer Science senior',
      avatar: undefined,
      createdAt: new Date(),
    },
  },
  {
    userId: '2',
    courses: ['Physics', 'Mathematics'],
    rates: 30,
    availability: [],
    ratings: 4.9,
    totalSessions: 62,
    bio: 'Physics PhD student specializing in quantum mechanics and thermodynamics.',
    verified: true,
    specialties: ['Quantum Physics', 'Thermodynamics'],
    user: {
      userId: '2',
      displayName: 'Sarah Johnson',
      bio: 'Physics PhD student',
      avatar: undefined,
      createdAt: new Date(),
    },
  },
];

const mockGroups: StudyGroup[] = [
  {
    groupId: '1',
    name: 'CS 161 Algorithm Study Group',
    description: 'Weekly study sessions for CS 161 - Design and Analysis of Algorithms. We cover problem-solving techniques and practice coding interviews.',
    course: 'Computer Science',
    topic: 'Algorithms',
    members: ['1', '2', '3', '4'],
    creatorId: '1',
    maxMembers: 8,
    isPrivate: false,
    createdAt: new Date(),
    tags: ['algorithms', 'coding', 'interviews'],
  },
  {
    groupId: '2',
    name: 'Organic Chemistry Lab Partners',
    description: 'Looking for lab partners for CHEM 3A. We meet before each lab to review procedures and discuss results.',
    course: 'Chemistry',
    topic: 'Organic Chemistry',
    members: ['2', '3'],
    creatorId: '2',
    maxMembers: 4,
    isPrivate: false,
    createdAt: new Date(),
    tags: ['chemistry', 'lab', 'organic'],
  },
];

const mockResources: Resource[] = [
  {
    resourceId: '1',
    title: 'Complete Data Structures Cheat Sheet',
    description: 'Comprehensive guide covering all major data structures with time/space complexity analysis and implementation examples.',
    fileUrl: 'ipfs://example1',
    uploaderId: '1',
    course: 'Computer Science',
    topic: 'Data Structures',
    price: 5,
    ratings: 4.7,
    totalRatings: 23,
    downloads: 156,
    fileType: 'PDF',
    fileSize: 2048000,
    createdAt: new Date(),
    tags: ['data-structures', 'algorithms', 'cheat-sheet'],
  },
  {
    resourceId: '2',
    title: 'Physics 7A Practice Midterm',
    description: 'Practice problems and solutions for Physics 7A midterm exam. Covers mechanics, waves, and thermodynamics.',
    fileUrl: 'ipfs://example2',
    uploaderId: '2',
    course: 'Physics',
    topic: 'Mechanics',
    price: 0,
    ratings: 4.9,
    totalRatings: 41,
    downloads: 289,
    fileType: 'PDF',
    fileSize: 1536000,
    createdAt: new Date(),
    tags: ['physics', 'practice-exam', 'mechanics'],
  },
];

export default function HomePage() {
  const { setFrameReady } = useMiniKit();

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  const handleGetStarted = () => {
    // Navigate to onboarding or sign up
    console.log('Get started clicked');
  };

  const handleExploreTutors = () => {
    // Navigate to tutors page
    window.location.href = '/tutors';
  };

  const handleBookSession = (tutorId: string) => {
    console.log('Book session with tutor:', tutorId);
  };

  const handleViewTutorProfile = (tutorId: string) => {
    console.log('View tutor profile:', tutorId);
  };

  const handleJoinGroup = (groupId: string) => {
    console.log('Join group:', groupId);
  };

  const handleViewGroup = (groupId: string) => {
    console.log('View group:', groupId);
  };

  const handleDownloadResource = (resourceId: string) => {
    console.log('Download resource:', resourceId);
  };

  const handlePurchaseResource = (resourceId: string) => {
    console.log('Purchase resource:', resourceId);
  };

  const handlePreviewResource = (resourceId: string) => {
    console.log('Preview resource:', resourceId);
  };

  return (
    <AppShell>
      <div className="space-y-12">
        {/* Hero Section */}
        <HeroSection
          onGetStarted={handleGetStarted}
          onExploreTutors={handleExploreTutors}
        />

        {/* Featured Tutors */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">
              Featured Tutors
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="grid gap-6">
            {mockTutors.map((tutor) => (
              <TutorCard
                key={tutor.userId}
                tutor={tutor}
                onBookSession={handleBookSession}
                onViewProfile={handleViewTutorProfile}
              />
            ))}
          </div>
        </section>

        {/* Popular Study Groups */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">
              Popular Study Groups
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="grid gap-6">
            {mockGroups.map((group) => (
              <StudyGroupCard
                key={group.groupId}
                group={group}
                onJoinGroup={handleJoinGroup}
                onViewGroup={handleViewGroup}
              />
            ))}
          </div>
        </section>

        {/* Top Resources */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">
              Top Resources
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="grid gap-6">
            {mockResources.map((resource) => (
              <ResourceCard
                key={resource.resourceId}
                resource={resource}
                onDownload={handleDownloadResource}
                onPurchase={handlePurchaseResource}
                onPreview={handlePreviewResource}
              />
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-text-primary">
              Ready to accelerate your learning?
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Join thousands of students who are already using EduNiche to excel in their studies.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" onClick={handleGetStarted}>
              Start Learning Today
            </Button>
            <Button variant="accent" size="lg">
              Become a Tutor
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
