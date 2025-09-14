// File: src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server';
import { getUserConversations, saveConversation } from '@/lib/db';

// GET /api/conversations - Get user's conversations
export async function GET(req: NextRequest) {
  try {
    // const { userId } = auth();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || req.headers.get('x-user-id');
    
    if (!userId) {
      return new NextResponse('Unauthorized - userId required', { status: 401 });
    }

    const conversations = await getUserConversations(userId);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/conversations - Create or update conversation
export async function POST(req: NextRequest) {
  try {
    // ✅ Get userId from request body instead of localStorage
    const body = await req.json();
    const userId = body.userId; // ← Extract from body that you're already sending
    
    if (!userId) {
      return new NextResponse('Unauthorized - userId required in body', { status: 400 });
    }

    // Validate other required fields
    if (!body.id || !body.messages) {
      return new NextResponse('Missing required fields: id, messages', { status: 400 });
    }

    const conversation = {
      ...body,
      userId, // Use the userId from the request body
      updatedAt: new Date(),
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    };

    await saveConversation(conversation);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}