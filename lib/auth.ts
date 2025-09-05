import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';
import { User } from './types';

// Privy configuration
export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  config: {
    loginMethods: ['farcaster', 'wallet'],
    appearance: {
      theme: 'dark',
      accentColor: '#6366f1',
      logo: '/logo.png',
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
    },
    farcaster: {
      enabled: true,
    },
  },
};

// Custom hook for authentication
export const useAuth = () => {
  const { user, login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();

  const signInWithFarcaster = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Farcaster login failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const getOrCreateUser = async (): Promise<User | null> => {
    if (!user?.farcaster?.fid) return null;

    const fid = user.farcaster.fid.toString();
    
    try {
      // Try to get existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', fid)
        .single();

      if (existingUser && !fetchError) {
        return {
          userId: existingUser.user_id,
          displayName: existingUser.display_name,
          bio: existingUser.bio || undefined,
          ensName: existingUser.ens_name || undefined,
          socialLinks: existingUser.social_links || undefined,
          tutoringOfferings: existingUser.tutoring_offerings || undefined,
          coursesTaken: existingUser.courses_taken || undefined,
          uploadedResources: existingUser.uploaded_resources || undefined,
          avatar: existingUser.avatar || undefined,
          createdAt: new Date(existingUser.created_at),
        };
      }

      // Create new user if doesn't exist
      const newUser: User = {
        userId: fid,
        displayName: user.farcaster.displayName || `User ${fid}`,
        bio: user.farcaster.bio || undefined,
        avatar: user.farcaster.pfp || undefined,
        createdAt: new Date(),
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert({
          user_id: newUser.userId,
          display_name: newUser.displayName,
          bio: newUser.bio,
          avatar: newUser.avatar,
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user:', createError);
        return null;
      }

      return newUser;
    } catch (error) {
      console.error('Error getting or creating user:', error);
      return null;
    }
  };

  const getWalletAddress = () => {
    const wallet = wallets.find(w => w.walletClientType === 'privy');
    return wallet?.address;
  };

  return {
    user,
    authenticated,
    ready,
    signInWithFarcaster,
    signOut,
    getOrCreateUser,
    getWalletAddress,
    wallets,
  };
};

// Helper function to check if user is authenticated
export const requireAuth = (callback: () => void) => {
  const { authenticated, ready } = usePrivy();
  
  if (!ready) return;
  
  if (!authenticated) {
    // Redirect to login or show login modal
    return;
  }
  
  callback();
};

// Helper function to get user's Farcaster profile
export const getFarcasterProfile = async (fid: string) => {
  try {
    const response = await fetch(`/api/farcaster/user/${fid}`);
    if (!response.ok) throw new Error('Failed to fetch Farcaster profile');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Farcaster profile:', error);
    return null;
  }
};
