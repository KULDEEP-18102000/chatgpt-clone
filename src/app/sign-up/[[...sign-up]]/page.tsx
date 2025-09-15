// import { SignUp } from '@clerk/nextjs';
import { SignUp } from "@/components/auth/sign-up";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Join ChatGPT Clone
          </h1>
          <p className="text-gray-400 mb-8">
            Create your account to get started
          </p>
        </div>

        <div className="flex justify-center">
          <SignUp /> {/* ← Simple, no appearance prop */}
        </div>
      </div>
    </div>
  );
}
