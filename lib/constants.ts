// App constants and configuration

export const APP_CONFIG = {
  name: 'EduNiche',
  tagline: 'Your academic co-pilot at the speed of Web3',
  version: '1.0.0',
  supportEmail: 'support@eduniche.app',
} as const;

export const COURSES = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Business',
  'Psychology',
  'History',
  'Literature',
  'Engineering',
  'Statistics',
  'Philosophy',
  'Political Science',
  'Sociology',
] as const;

export const SUBJECTS = {
  'Computer Science': [
    'Data Structures',
    'Algorithms',
    'Web Development',
    'Machine Learning',
    'Database Systems',
    'Operating Systems',
    'Software Engineering',
    'Computer Networks',
  ],
  'Mathematics': [
    'Calculus',
    'Linear Algebra',
    'Discrete Mathematics',
    'Statistics',
    'Differential Equations',
    'Number Theory',
    'Geometry',
    'Probability',
  ],
  'Physics': [
    'Mechanics',
    'Thermodynamics',
    'Electromagnetism',
    'Quantum Physics',
    'Optics',
    'Nuclear Physics',
    'Astrophysics',
    'Solid State Physics',
  ],
  // Add more subjects for other courses as needed
} as const;

export const SESSION_DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
] as const;

export const PRICE_RANGES = [
  { min: 0, max: 0, label: 'Free' },
  { min: 1, max: 10, label: '$1 - $10' },
  { min: 11, max: 25, label: '$11 - $25' },
  { min: 26, max: 50, label: '$26 - $50' },
  { min: 51, max: 100, label: '$51 - $100' },
  { min: 101, max: Infinity, label: '$100+' },
] as const;

export const FILE_TYPES = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'text/plain': 'TXT',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
} as const;

export const NAVIGATION_ITEMS = [
  { label: 'Home', href: '/', icon: 'Home' },
  { label: 'Tutors', href: '/tutors', icon: 'Users' },
  { label: 'Study Groups', href: '/groups', icon: 'Users2' },
  { label: 'Resources', href: '/resources', icon: 'BookOpen' },
  { label: 'Profile', href: '/profile', icon: 'User' },
] as const;

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/eduniche',
  discord: 'https://discord.gg/eduniche',
  github: 'https://github.com/eduniche',
  docs: 'https://docs.eduniche.app',
} as const;

export const API_ENDPOINTS = {
  users: '/api/users',
  tutors: '/api/tutors',
  sessions: '/api/sessions',
  groups: '/api/groups',
  resources: '/api/resources',
  ratings: '/api/ratings',
  payments: '/api/payments',
} as const;

export const STORAGE_KEYS = {
  user: 'eduniche_user',
  preferences: 'eduniche_preferences',
  cart: 'eduniche_cart',
} as const;
