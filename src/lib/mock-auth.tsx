// File: src/lib/mock-auth.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock user interface that matches Clerk's structure
export interface MockUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string; id: string }>;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date | null;
}

interface AuthContextType {
  user: MockUser | null;
  userId: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Mock auth provider
export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('mock-auth-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt),
          updatedAt: new Date(parsedUser.updatedAt),
          lastSignInAt: parsedUser.lastSignInAt ? new Date(parsedUser.lastSignInAt) : null,
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('mock-auth-user');
      }
    }
    setIsLoaded(true);
  }, []);

  const signIn = async (email: string) => {
    // Mock sign-in logic - in real app, you'd validate against a database
    // For now, just create a user object
    const mockUser: MockUser = {
      id: `user_${Date.now()}`,
      emailAddresses: [{ emailAddress: email, id: 'email_1' }],
      firstName: email.split('@')[0],
      lastName: null,
      profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      username: email.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignInAt: new Date(),
    };

    setUser(mockUser);
    localStorage.setItem('mock-auth-user', JSON.stringify(mockUser));
  };

  const signUp = async (email: string, password: string, firstName?: string) => {
    // Mock sign-up logic
    const mockUser: MockUser = {
      id: `user_${Date.now()}`,
      emailAddresses: [{ emailAddress: email, id: 'email_1' }],
      firstName: firstName || email.split('@')[0],
      lastName: null,
      profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      username: email.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignInAt: new Date(),
    };

    setUser(mockUser);
    localStorage.setItem('mock-auth-user', JSON.stringify(mockUser));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('mock-auth-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user?.id || null,
        isLoaded,
        isSignedIn: !!user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Mock useUser hook that matches Clerk's structure
export function useUser() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useUser must be used within MockAuthProvider');
  }
  
  return {
    user: context.user,
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
  };
}

// Mock auth function that matches Clerk's server-side auth
export function auth() {
  // This is a client-side mock - in a real app with SSR, you'd handle this differently
  if (typeof window === 'undefined') {
    return { userId: null };
  }

  const savedUser = localStorage.getItem('mock-auth-user');
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      return { userId: parsedUser.id };
    } catch {
      return { userId: null };
    }
  }
  
  return { userId: null };
}