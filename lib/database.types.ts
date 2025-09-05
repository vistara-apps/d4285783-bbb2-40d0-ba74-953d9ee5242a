export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          display_name: string
          bio: string | null
          ens_name: string | null
          social_links: string[] | null
          tutoring_offerings: string[] | null
          courses_taken: string[] | null
          uploaded_resources: string[] | null
          avatar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          display_name: string
          bio?: string | null
          ens_name?: string | null
          social_links?: string[] | null
          tutoring_offerings?: string[] | null
          courses_taken?: string[] | null
          uploaded_resources?: string[] | null
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string
          bio?: string | null
          ens_name?: string | null
          social_links?: string[] | null
          tutoring_offerings?: string[] | null
          courses_taken?: string[] | null
          uploaded_resources?: string[] | null
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tutor_profiles: {
        Row: {
          user_id: string
          courses: string[]
          rates: number
          availability: Json
          ratings: number
          total_sessions: number
          bio: string
          verified: boolean
          specialties: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          courses: string[]
          rates: number
          availability?: Json
          ratings?: number
          total_sessions?: number
          bio: string
          verified?: boolean
          specialties: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          courses?: string[]
          rates?: number
          availability?: Json
          ratings?: number
          total_sessions?: number
          bio?: string
          verified?: boolean
          specialties?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      tutoring_sessions: {
        Row: {
          session_id: string
          tutor_id: string
          student_id: string
          course: string
          date_time: string
          duration: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          payment_details: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          session_id?: string
          tutor_id: string
          student_id: string
          course: string
          date_time: string
          duration: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          payment_details: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          session_id?: string
          tutor_id?: string
          student_id?: string
          course?: string
          date_time?: string
          duration?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          payment_details?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_groups: {
        Row: {
          group_id: string
          name: string
          description: string
          course: string
          topic: string
          members: string[]
          creator_id: string
          max_members: number
          is_private: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          group_id?: string
          name: string
          description: string
          course: string
          topic: string
          members?: string[]
          creator_id: string
          max_members?: number
          is_private?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          group_id?: string
          name?: string
          description?: string
          course?: string
          topic?: string
          members?: string[]
          creator_id?: string
          max_members?: number
          is_private?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          resource_id: string
          title: string
          description: string
          file_url: string
          uploader_id: string
          course: string
          topic: string
          price: number
          ratings: number
          total_ratings: number
          downloads: number
          file_type: string
          file_size: number
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          resource_id?: string
          title: string
          description: string
          file_url: string
          uploader_id: string
          course: string
          topic: string
          price?: number
          ratings?: number
          total_ratings?: number
          downloads?: number
          file_type: string
          file_size: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          resource_id?: string
          title?: string
          description?: string
          file_url?: string
          uploader_id?: string
          course?: string
          topic?: string
          price?: number
          ratings?: number
          total_ratings?: number
          downloads?: number
          file_type?: string
          file_size?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          rating_id: string
          entity_type: 'tutor' | 'resource' | 'study_group'
          entity_id: string
          user_id: string
          score: number
          comment: string | null
          created_at: string
        }
        Insert: {
          rating_id?: string
          entity_type: 'tutor' | 'resource' | 'study_group'
          entity_id: string
          user_id: string
          score: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          rating_id?: string
          entity_type?: 'tutor' | 'resource' | 'study_group'
          entity_id?: string
          user_id?: string
          score?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      session_status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
      entity_type: 'tutor' | 'resource' | 'study_group'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
