'use client';
// import { auth } from '@clerk/nextjs/server';
// import { redirect } from 'next/navigation';
import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  // const user=localStorage.getItem('user');
  // const { userId } = auth();

  // const userId = user ? JSON.parse(user).id : null;

  // if (!userId) {
  //   redirect('/');
  // }

  return <ChatInterface />;
}