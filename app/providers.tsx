'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { base } from 'viem/chains';
import { http } from 'viem';
import { createConfig } from 'wagmi';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { privyConfig } from '@/lib/auth';
import { type ReactNode } from 'react';

// Wagmi configuration
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <MiniKitProvider
            chain={base}
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || 'cdp_demo_key'}
          >
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(220 15% 18%)',
                  color: 'hsl(0 0% 95%)',
                  border: '1px solid hsl(220 15% 25%)',
                },
                success: {
                  iconTheme: {
                    primary: 'hsl(170 60% 45%)',
                    secondary: 'hsl(220 15% 18%)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'hsl(0 84% 60%)',
                    secondary: 'hsl(220 15% 18%)',
                  },
                },
              }}
            />
          </MiniKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
