'use client';

import { useState } from 'react';
import { Menu, X, Home, Users, Users2, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name } from '@coinbase/onchainkit/identity';
import { LoginButton } from '@/components/auth/LoginButton';

interface AppShellProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Tutors', href: '/tutors', icon: Users },
  { name: 'Study Groups', href: '/groups', icon: Users2 },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Profile', href: '/profile', icon: User },
];

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="w-full max-w-screen-sm mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gradient">
                  {APP_CONFIG.name}
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <div className="flex items-center space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="nav-link flex items-center space-x-1 px-3 py-2 rounded-md text-sm"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </a>
                  );
                })}
              </div>
            </nav>

            {/* Authentication & Wallet */}
            <div className="flex items-center space-x-4">
              <LoginButton variant="outline" size="sm" />
              <Wallet>
                <ConnectWallet>
                  <Name />
                </ConnectWallet>
              </Wallet>

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface/60 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="nav-link flex items-center space-x-2 px-3 py-2 rounded-md text-base"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-screen-sm mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-white/10 mt-12">
        <div className="w-full max-w-screen-sm mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-text-secondary text-sm">
              © 2024 {APP_CONFIG.name}. Built on Base.
            </p>
            <p className="text-text-secondary text-xs mt-1">
              {APP_CONFIG.tagline}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
