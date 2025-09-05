import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, TutorProfile, StudyGroup, Resource, TutoringSession } from './types';

// Auth store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Tutors store
interface TutorsState {
  tutors: (TutorProfile & { user: User })[];
  loading: boolean;
  error: string | null;
  filters: {
    course: string;
    minRating: number;
    maxRate: number;
    specialties: string[];
  };
  setTutors: (tutors: (TutorProfile & { user: User })[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<TutorsState['filters']>) => void;
  clearFilters: () => void;
}

export const useTutorsStore = create<TutorsState>((set) => ({
  tutors: [],
  loading: false,
  error: null,
  filters: {
    course: '',
    minRating: 0,
    maxRate: 1000,
    specialties: [],
  },
  setTutors: (tutors) => set({ tutors }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({
    filters: {
      course: '',
      minRating: 0,
      maxRate: 1000,
      specialties: [],
    }
  }),
}));

// Study Groups store
interface StudyGroupsState {
  groups: StudyGroup[];
  loading: boolean;
  error: string | null;
  filters: {
    course: string;
    topic: string;
    tags: string[];
  };
  setGroups: (groups: StudyGroup[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<StudyGroupsState['filters']>) => void;
  clearFilters: () => void;
  joinGroup: (groupId: string, userId: string) => void;
  leaveGroup: (groupId: string, userId: string) => void;
}

export const useStudyGroupsStore = create<StudyGroupsState>((set) => ({
  groups: [],
  loading: false,
  error: null,
  filters: {
    course: '',
    topic: '',
    tags: [],
  },
  setGroups: (groups) => set({ groups }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({
    filters: {
      course: '',
      topic: '',
      tags: [],
    }
  }),
  joinGroup: (groupId, userId) => set((state) => ({
    groups: state.groups.map(group =>
      group.groupId === groupId
        ? { ...group, members: [...group.members, userId] }
        : group
    )
  })),
  leaveGroup: (groupId, userId) => set((state) => ({
    groups: state.groups.map(group =>
      group.groupId === groupId
        ? { ...group, members: group.members.filter(id => id !== userId) }
        : group
    )
  })),
}));

// Resources store
interface ResourcesState {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  filters: {
    course: string;
    topic: string;
    priceRange: [number, number];
    fileType: string;
    tags: string[];
  };
  setResources: (resources: Resource[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ResourcesState['filters']>) => void;
  clearFilters: () => void;
  incrementDownloads: (resourceId: string) => void;
}

export const useResourcesStore = create<ResourcesState>((set) => ({
  resources: [],
  loading: false,
  error: null,
  filters: {
    course: '',
    topic: '',
    priceRange: [0, 100],
    fileType: '',
    tags: [],
  },
  setResources: (resources) => set({ resources }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({
    filters: {
      course: '',
      topic: '',
      priceRange: [0, 100],
      fileType: '',
      tags: [],
    }
  }),
  incrementDownloads: (resourceId) => set((state) => ({
    resources: state.resources.map(resource =>
      resource.resourceId === resourceId
        ? { ...resource, downloads: resource.downloads + 1 }
        : resource
    )
  })),
}));

// Sessions store
interface SessionsState {
  sessions: TutoringSession[];
  loading: boolean;
  error: string | null;
  setSessions: (sessions: TutoringSession[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addSession: (session: TutoringSession) => void;
  updateSession: (sessionId: string, updates: Partial<TutoringSession>) => void;
  removeSession: (sessionId: string) => void;
}

export const useSessionsStore = create<SessionsState>((set) => ({
  sessions: [],
  loading: false,
  error: null,
  setSessions: (sessions) => set({ sessions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
  updateSession: (sessionId, updates) => set((state) => ({
    sessions: state.sessions.map(session =>
      session.sessionId === sessionId
        ? { ...session, ...updates }
        : session
    )
  })),
  removeSession: (sessionId) => set((state) => ({
    sessions: state.sessions.filter(session => session.sessionId !== sessionId)
  })),
}));

// UI store for global UI state
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: 'dark',
      notifications: [],
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setTheme: (theme) => set({ theme }),
      addNotification: (notification) => set((state) => ({
        notifications: [
          ...state.notifications,
          {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
          }
        ]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
