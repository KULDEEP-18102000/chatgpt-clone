export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string; // Enhanced content with attachments
  timestamp: Date;
  attachments?: Attachment[];
  originalContent?: string; // Original text without attachments (optional)
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: 'image' | 'file';
  url: string;
  file?: File;
  uploading?: boolean;
  uploadFailed?: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentConversation: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSignup {
  name: string;
  email: string;
  password: string;
}

export interface UserSignin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}