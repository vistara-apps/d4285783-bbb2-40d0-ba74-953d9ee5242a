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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "tutor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "tutoring_sessions_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tutoring_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "study_groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "resources_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
