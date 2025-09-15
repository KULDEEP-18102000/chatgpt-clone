// import { auth } from '@clerk/nextjs/server';
// import { SignIn } from '@clerk/nextjs';
'use client';
import { SignIn } from '@/components/auth/sign-in';
import { auth } from '@/lib/mock-auth';
import { redirect } from 'next/navigation';

export default function HomePage() {
  const { userId } = auth();

  if (userId) {
    redirect('/chat');
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">ChatGPT Clone</h1>
          <p className="text-gray-400 mb-8">Sign in to start chatting with AI</p>
        </div>
        
        <div className="flex justify-center">
          <SignIn />  {/* ← Simple, no appearance prop */}
        </div>
        
        {/* <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <a href="/sign-up" className="text-blue-400 hover:text-blue-300 underline">
              Sign up here
            </a>
          </p>
        </div> */}
      </div>
    </div>
  );
}