// api/auth/signup/route.ts or pages/api/auth/signup.ts (depending on your Next.js version)

import { NextRequest, NextResponse } from 'next/server';
import { signupUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name, email, and password are required' 
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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must be at least 6 characters long' 
        },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name must be at least 2 characters long' 
        },
        { status: 400 }
      );
    }

    // Create user
    const user = await signupUser({
      name: name.trim(),
      email: email.trim(),
      password
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        user
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup API Error:', error);

    // Handle specific error cases
    if (error.message.includes('User already exists')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'An account with this email already exists' 
        },
        { status: 409 }
      );
    }

    if (error.message.includes('E11000 duplicate key')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'An account with this email already exists' 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create account. Please try again.' 
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