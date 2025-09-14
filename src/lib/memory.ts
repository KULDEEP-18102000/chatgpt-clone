import { Message } from '@/types';

class MemoryManager {
  private apiKey: string;
  private baseUrl = 'https://mem0.ai/';

  constructor() {
    this.apiKey = process.env.MEM0_API_KEY!;
  }

  async addMemory(userId: string, message: string) {
    try {
      const response = await fetch(`${this.baseUrl}/memories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          messages: [{ role: 'user', content: message }],
        }),
      });

      // return await response.json();
      return response;
    } catch (error) {
      console.error('Error adding memory:', error);
      return null;
    }
  }

  async getMemories(userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/memories?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Error getting memories:', error);
      return [];
    }
  }

  async searchMemories(userId: string, query: string) {
    try {
      console.log("query",query);
      console.log("userId",userId);
      console.log("this.apiKey",this.apiKey);
      console.log("this.baseUrl",this.baseUrl);
      const response = await fetch(`${this.baseUrl}/memories/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          query,
        }),
      });

      console.log("response",response);

      return response;
    } catch (error) {
      console.error('Error searching memories:', error);
      return [];
    }
  }
}

export const memoryManager = new MemoryManager();