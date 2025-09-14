'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import Link from 'next/link';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Direct API call to signin endpoint
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.user) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        // Redirect to chat page
        router.push('/chat');
      } else {
        // Handle API error
        setError(result.message || 'Failed to sign in. Please try again.');
      }
    } catch (err) {
      console.error('Signin error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-800 border-gray-700">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-white">Sign In</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-gray-700 border-gray-600 text-white"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="bg-gray-700 border-gray-600 text-white"
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 underline">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}