import { MongoClient, Db } from 'mongodb';
import { Conversation,User,UserSignup,UserSignin,UserResponse } from '@/types';
import bcrypt from 'bcryptjs';

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (db) return { client, db };

  try {
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    db = client.db('chatgpt_clone');
    
    // Create indexes for better performance
    await db.collection('conversations').createIndex({ userId: 1, updatedAt: -1 });
    await db.collection('conversations').createIndex({ id: 1 });
    
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function saveConversation(conversation: Conversation) {
  const { db } = await connectToDatabase();
  
  return await db.collection('conversations').replaceOne(
    { id: conversation.id },
    conversation,
    { upsert: true }
  );
}

export async function getConversation(conversationId: string, userId: string) {
  const { db } = await connectToDatabase();
  
  return await db.collection('conversations').findOne({
    id: conversationId,
    userId
  });
}

export async function getUserConversations(userId: string) {
  const { db } = await connectToDatabase();
  
  const conversations = await db.collection('conversations')
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();

  // Convert MongoDB _id to regular objects and ensure proper date formatting
  return conversations.map(conv => ({
    ...conv,
    _id: undefined,
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt),
  }));
}

export async function updateConversation(conversationId: string, updates: Partial<Conversation>) {
  const { db } = await connectToDatabase();
  
  return await db.collection('conversations').updateOne(
    { id: conversationId },
    { 
      $set: {
        ...updates,
        updatedAt: new Date()
      }
    }
  );
}

export async function deleteConversation(conversationId: string, userId: string) {
  const { db } = await connectToDatabase();
  
  return await db.collection('conversations').deleteOne({
    id: conversationId,
    userId
  });
}

// Helper function to get conversation count for a user
export async function getConversationCount(userId: string): Promise<number> {
  const { db } = await connectToDatabase();
  
  return await db.collection('conversations').countDocuments({ userId });
}

// Helper function to get recent conversations
export async function getRecentConversations(userId: string, limit: number = 10) {
  const { db } = await connectToDatabase();
  
  const conversations = await db.collection('conversations')
    .find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();

  return conversations.map(conv => ({
    ...conv,
    _id: undefined,
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt),
  }));
}

// Cleanup old conversations (optional - for maintenance)
export async function cleanupOldConversations(userId: string, keepCount: number = 50) {
  const { db } = await connectToDatabase();
  
  const conversations = await db.collection('conversations')
    .find({ userId })
    .sort({ updatedAt: -1 })
    .skip(keepCount)
    .toArray();

  if (conversations.length > 0) {
    const idsToDelete = conversations.map(conv => conv.id);
    return await db.collection('conversations').deleteMany({
      id: { $in: idsToDelete },
      userId
    });
  }

  return { deletedCount: 0 };
}

export async function signupUser(userData: UserSignup): Promise<UserResponse> {
  const { db } = await connectToDatabase();
  
  try {
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    // Create user object
    const user: User = {
      id: crypto.randomUUID(), // You can use crypto.randomUUID() or similar
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert user into database
    await db.collection('users').insertOne(user);
    
    // Return user data without password
    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    // Store in localStorage (if running in browser environment)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userResponse));
    }
    
    return userResponse;
    
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

export async function signinUser(credentials: UserSignin): Promise<UserResponse> {
  const { db } = await connectToDatabase();
  
  try {
    // Find user by email
    const user = await db.collection('users').findOne({ 
      email: credentials.email.toLowerCase() 
    });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Update last login time
    await db.collection('users').updateOne(
      { id: user.id },
      { $set: { updatedAt: new Date() } }
    );
    
    // Prepare user response without password
    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(),
    };
    
    // Store in localStorage (if running in browser environment)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userResponse));
    }
    
    return userResponse;
    
  } catch (error) {
    console.error('Signin error:', error);
    throw error;
  }
}

export async function signoutUser(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

export function getCurrentUser(): UserResponse | null {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
  }
  return null;
}

export async function getUserById(userId: string): Promise<UserResponse | null> {
  const { db } = await connectToDatabase();
  
  const user = await db.collection('users').findOne({ id: userId });
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}