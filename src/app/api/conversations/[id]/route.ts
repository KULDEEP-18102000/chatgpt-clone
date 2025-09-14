// File: src/app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConversation, deleteConversation, updateConversation } from '@/lib/db';

// GET /api/conversations/[id] - Get specific conversation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Updated type signature
) {
  try {
    // ✅ Await params before using - Next.js 15 requirement
    const { id } = await params;
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || req.headers.get('x-user-id');
        
    if (!userId) {
      return new NextResponse('Unauthorized - userId required', { status: 401 });
    }

    const conversation = await getConversation(id, userId);  // ✅ Use awaited id
            
    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH /api/conversations/[id] - Update conversation
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Updated type signature
) {
  try {
    // ✅ Await params before using
    const { id } = await params;
    console.log("id", id);
    
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const userId = body.userId || searchParams.get('userId') || req.headers.get('x-user-id');
    
    if (!userId) {
      return new NextResponse('Unauthorized - userId required', { status: 401 });
    }

    // Verify user owns this conversation
    const existingConversation = await getConversation(id, userId);  // ✅ Use awaited id
    if (!existingConversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    const updatedConversation = {
      ...existingConversation,
      ...body,
      updatedAt: new Date(),
    };

    await updateConversation(id, updatedConversation);  // ✅ Use awaited id
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Updated type signature
) {
  try {
    // ✅ Await params before using - This fixes your error!
    const { id } = await params;
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || req.headers.get('x-user-id');
        
    if (!userId) {
      return new NextResponse('Unauthorized - userId required', { status: 401 });
    }

    // Verify user owns this conversation
    const existingConversation = await getConversation(id, userId);  // ✅ Use awaited id
      
    if (!existingConversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    await deleteConversation(id, userId);  // ✅ Use awaited id - This was causing the error!
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}