// import { SignIn } from '@clerk/nextjs';
import { SignIn } from "@/components/auth/sign-in";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 mb-8">Sign in to continue chatting</p>
        </div>
        
        <div className="flex justify-center">
          <SignIn />  {/* ← Simple, no appearance prop */}
        </div>
      </div>
    </div>
  );
}