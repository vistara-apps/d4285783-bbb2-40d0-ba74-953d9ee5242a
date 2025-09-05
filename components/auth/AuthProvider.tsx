'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { base } from 'viem/chains';
import { User } from '@/lib/types';
import { authService } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { ready, authenticated, user: privyUser, login, logout } = usePrivy();

  const isAuthenticated = authenticated && !!user;

  useEffect(() => {
    if (ready) {
      if (authenticated && privyUser) {
        handlePrivyUser();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, [ready, authenticated, privyUser]);

  const handlePrivyUser = async () => {
    if (!privyUser) return;

    try {
      setIsLoading(true);
      
      // Extract Farcaster data from Privy user
      const farcasterAccount = privyUser.linkedAccounts.find(
        (account) => account.type === 'farcaster'
      );

      if (farcasterAccount && 'fid' in farcasterAccount) {
        const farcasterData = {
          fid: farcasterAccount.fid,
          displayName: farcasterAccount.displayName || `User ${farcasterAccount.fid}`,
          avatar: farcasterAccount.pfp,
          bio: farcasterAccount.bio,
          ensName: undefined, // ENS would come from wallet connection
        };

        const { user: authUser } = await authService.signInWithFarcaster(farcasterData);
        setUser(authUser);
      }
    } catch (error) {
      console.error('Error handling Privy user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      await logout();
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  if (!appId) {
    console.error('NEXT_PUBLIC_PRIVY_APP_ID is not set');
    return <div>Authentication configuration error</div>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['farcaster'],
        appearance: {
          theme: 'dark',
          accentColor: '#10B981',
          logo: '/logo.png',
        },
        defaultChain: base,
        supportedChains: [base],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </PrivyProvider>
  );
}
