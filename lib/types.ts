// Core data types for EduNiche

export interface User {
  userId: string; // Farcaster FID
  displayName: string;
  bio?: string;
  ensName?: string;
  socialLinks?: string[];
  tutoringOfferings?: string[];
  coursesTaken?: string[];
  uploadedResources?: string[];
  avatar?: string;
  createdAt: Date;
}

export interface TutorProfile {
  userId: string;
  courses: string[];
  rates: number; // per 30 min session in USDC
  availability: TimeSlot[];
  ratings: number;
  totalSessions: number;
  bio: string;
  verified: boolean;
  specialties: string[];
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface TutoringSession {
  sessionId: string;
  tutorId: string;
  studentId: string;
  course: string;
  dateTime: Date;
  duration: number; // in minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentDetails: PaymentDetails;
  notes?: string;
}

export interface PaymentDetails {
  amount: number;
  currency: 'USDC';
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface StudyGroup {
  groupId: string;
  name: string;
  description: string;
  course: string;
  topic: string;
  members: string[]; // user IDs
  creatorId: string;
  maxMembers: number;
  isPrivate: boolean;
  createdAt: Date;
  tags: string[];
}

export interface Resource {
  resourceId: string;
  title: string;
  description: string;
  fileUrl: string; // IPFS URL
  uploaderId: string;
  course: string;
  topic: string;
  price: number; // in USDC, 0 for free
  ratings: number;
  totalRatings: number;
  downloads: number;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  tags: string[];
}

export interface Rating {
  ratingId: string;
  entityType: 'tutor' | 'resource' | 'study_group';
  entityId: string;
  userId: string;
  score: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// UI Component Props
export interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}
