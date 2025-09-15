import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { contextManager } from '@/lib/context-manager';
import { memoryManager } from '@/lib/memory';
// import { saveConversation, getConversation } from '@/lib/db';
import { Memory } from '@/types';

// 🎭 MOCK RESPONSES (remove after Gemini is working)
const MOCK_RESPONSES = [
  "That's an interesting question! I'd be happy to help you with that. Based on what you're asking, here are some key points to consider...",
  "Great question! Let me break this down for you in a simple way that's easy to understand...",
  "I understand what you're looking for. Here's my take on this topic, along with some practical insights...",
  "Thanks for asking! This is actually a topic I find quite fascinating. Let me share some thoughts on this...",
  "Excellent point! There are several ways to approach this, and I'll walk you through the most effective ones...",
  "That's a really good question that many people wonder about. Here's what I would recommend...",
  "I appreciate you bringing this up! Based on common patterns and best practices, here's what typically works well...",
  "Interesting topic! Let me provide you with a comprehensive answer that covers the main aspects you should know about...",
  "Good thinking on this one! There are a few different perspectives to consider, and I'll outline the key ones for you...",
  "Thanks for the question! This is something that can be approached in multiple ways, and I'll explain the most practical solution..."
];

function getRandomMockResponse(userMessage: string): string {
  const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  
  // Add context based on user's message
  let contextualResponse = randomResponse;
  
  if (userMessage.toLowerCase().includes('javascript')) {
    contextualResponse += " JavaScript is a versatile programming language that powers modern web development, from frontend interactions to backend services.";
  } else if (userMessage.toLowerCase().includes('react')) {
    contextualResponse += " React is a popular JavaScript library for building user interfaces, especially for web applications with complex state management.";
  } else if (userMessage.toLowerCase().includes('api')) {
    contextualResponse += " APIs (Application Programming Interfaces) are essential for connecting different software systems and enabling data exchange between applications.";
  } else {
    contextualResponse += " This is definitely a topic worth exploring further, and there are many resources available to dive deeper into this subject.";
  }
  
  contextualResponse += "\n\n💡 Note: This is a temporary mock response. Gemini AI will be integrated soon!";
  return contextualResponse;
}


export async function POST(req: NextRequest) {
  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new NextResponse('Invalid JSON in request body', { status: 400 });
    }

    const { messages, userId } = requestBody;
    
    // Input validation
    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse('Messages array is required and cannot be empty', { status: 400 });
    }

    // Get user's message for mock response
    const userMessage = messages[messages.length - 1];
    console.log('👤 User message:', userMessage.content);

    
    let memories: Memory[] = [];
    try {
      const memoriesResult = await memoryManager.searchMemories(userId, userMessage.content);
      if (Array.isArray(memoriesResult)) {
        memories = memoriesResult;
      }
    } catch (error) {
      console.error('Memory service error:', error);
    }

    console.log('memories', memories);
        
    // Add memory context to system message
    const memoryContext = memories.length > 0 
      ? `Here's some relevant context from previous conversations: ${memories.map((m: Memory) => m.text).join('\n')}` 
      : 'No previous context available.';
    
      console.log('memoryContext', memoryContext);
    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful AI assistant. ${memoryContext}`
    };
    console.log('systemMessage', systemMessage);

    // Manage context window
    const contextMessages = contextManager.trimConversation([systemMessage, ...messages]);
    console.log('contextMessages', contextMessages);

    // ✅ GEMINI API CALL
    try {
      const result = await streamText({
        model: google('gemini-1.5-flash'), // or 'gemini-1.5-pro' for better quality
        messages: contextMessages,
        temperature: 0.7,
        // maxTokens: 2000,
      });
      console.log('Gemini API response:', result);

      // Try to save memory
      try {
        await memoryManager.addMemory(userId, userMessage.content);
      } catch (error) {
        console.log('Memory save failed (continuing anyway):', error);
      }

      return result.toTextStreamResponse();
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fall back to mock response if Gemini fails
      const mockResponse = getRandomMockResponse(userMessage.content);
      return new NextResponse(mockResponse);
    }

    // 🎭 TEMPORARY MOCK RESPONSE SYSTEM (remove after Gemini setup)
    // console.log('🎭 Using mock response system (Gemini integration pending)');
    
    // const mockResponse = getRandomMockResponse(userMessage.content);
    // console.log('🤖 Mock response generated');

    // // Try to save memory (but handle errors gracefully)
    // try {
    //   await memoryManager.addMemory(userId, userMessage.content);
    //   console.log('💾 Memory saved successfully');
    // } catch (error) {
    //   console.log('⚠️ Memory save failed (continuing anyway):', error);
    // }

    // return new NextResponse(mockResponse, {
    //   status: 200,
    //   headers: {
    //     'Content-Type': 'text/plain; charset=utf-8',
    //   },
    // });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    return new NextResponse(`Error: ${'Internal Server Error'}`, { status: 500 });
  }
}

// 📋 TODO: After setting up Gemini API:
// 1. Uncomment the Gemini API section
// 2. Remove the mock response system section  
// 3. Test with real Gemini responses