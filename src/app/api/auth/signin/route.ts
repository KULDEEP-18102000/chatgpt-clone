// api/auth/signin/route.ts or pages/api/auth/signin.ts (depending on your Next.js version)

import { NextRequest, NextResponse } from 'next/server';
import { signinUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please provide a valid email address' 
        },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await signinUser({
      email: email.trim(),
      password
    });

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      data: {
        user
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Signin API Error:', error);

    // Handle specific error cases
    if (error.message.includes('Invalid email or password')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to sign in. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}