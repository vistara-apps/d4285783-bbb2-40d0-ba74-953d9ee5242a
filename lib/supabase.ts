import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Admin client for server-side operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper functions for common operations
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const getTutorProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('tutor_profiles')
    .select(`
      *,
      users (*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const getStudyGroups = async (limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('study_groups')
    .select(`
      *,
      users!study_groups_creator_id_fkey (display_name, avatar)
    `)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getResources = async (limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      *,
      users!resources_uploader_id_fkey (display_name, avatar)
    `)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getTutors = async (limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('tutor_profiles')
    .select(`
      *,
      users (*)
    `)
    .eq('verified', true)
    .range(offset, offset + limit - 1)
    .order('ratings', { ascending: false });

  if (error) throw error;
  return data;
};
