import { createClientComponentClient } from './supabase';
import { User } from './types';

export interface AuthUser {
  id: string;
  farcasterFid?: number;
  displayName: string;
  avatar?: string;
  ensName?: string;
}

export class AuthService {
  private supabase = createClientComponentClient();

  async signInWithFarcaster(farcasterData: {
    fid: number;
    displayName: string;
    avatar?: string;
    bio?: string;
    ensName?: string;
  }): Promise<{ user: User; isNewUser: boolean }> {
    const userId = farcasterData.fid.toString();
    
    // Check if user exists
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingUser) {
      // Update user data
      const { data: updatedUser, error } = await this.supabase
        .from('users')
        .update({
          display_name: farcasterData.displayName,
          avatar: farcasterData.avatar,
          ens_name: farcasterData.ensName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      
      return {
        user: this.mapDatabaseUserToUser(updatedUser),
        isNewUser: false,
      };
    } else {
      // Create new user
      const { data: newUser, error } = await this.supabase
        .from('users')
        .insert({
          user_id: userId,
          display_name: farcasterData.displayName,
          bio: farcasterData.bio,
          avatar: farcasterData.avatar,
          ens_name: farcasterData.ensName,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        user: this.mapDatabaseUserToUser(newUser),
        isNewUser: true,
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // This would typically get the current user from the auth context
    // For now, we'll implement a basic version
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (!session?.user) return null;

    const { data: user } = await this.supabase
      .from('users')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    return user ? this.mapDatabaseUserToUser(user) : null;
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  private mapDatabaseUserToUser(dbUser: any): User {
    return {
      userId: dbUser.user_id,
      displayName: dbUser.display_name,
      bio: dbUser.bio,
      ensName: dbUser.ens_name,
      socialLinks: dbUser.social_links || [],
      tutoringOfferings: dbUser.tutoring_offerings || [],
      coursesTaken: dbUser.courses_taken || [],
      uploadedResources: dbUser.uploaded_resources || [],
      avatar: dbUser.avatar,
      createdAt: new Date(dbUser.created_at),
    };
  }
}

export const authService = new AuthService();
