import { Message } from '@/types';

export class ContextManager {
  private maxTokens: number;
  private tokensPerMessage = 100; // Approximate tokens per message

  constructor(maxTokens = 8000) {
    this.maxTokens = maxTokens;
  }

  // Estimate token count for a message
  private estimateTokens(message: Message): number {
    return Math.ceil(message.content.length / 4) + this.tokensPerMessage;
  }

  // ✅ Fixed: Trim conversation to fit within context window with proper message ordering
  trimConversation(messages: Message[]): Message[] {
    let totalTokens = 0;
    const result: Message[] = [];

    // Find system message
    const systemMessage = messages.find(m => m.role === 'system');
    
    // ✅ Add system message FIRST if present (required by Gemini)
    if (systemMessage) {
      result.push(systemMessage);
      totalTokens += this.estimateTokens(systemMessage);
    }

    // Get non-system messages in order
    const nonSystemMessages = messages.filter(m => m.role !== 'system');
    
    // ✅ Add messages from most recent, but maintain chronological order
    const messagesToInclude: Message[] = [];
    
    // Work backwards to fit within token limit
    for (let i = nonSystemMessages.length - 1; i >= 0; i--) {
      const message = nonSystemMessages[i];
      const messageTokens = this.estimateTokens(message);
      
      if (totalTokens + messageTokens > this.maxTokens) {
        break;
      }

      messagesToInclude.unshift(message); // Add to beginning to maintain order
      totalTokens += messageTokens;
    }

    // ✅ Add non-system messages AFTER system message in chronological order
    result.push(...messagesToInclude);

    console.log('✅ Trimmed messages order:', result.map(m => ({ role: m.role, content: m.content.substring(0, 50) })));

    return result;
  }

  // ✅ Fixed: Segment large conversations into chunks with proper ordering
  segmentConversation(messages: Message[], overlap = 2): Message[][] {
    const segments: Message[][] = [];
    const systemMessage = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    let currentSegment: Message[] = [];
    let currentTokens = 0;

    // Account for system message tokens if present
    const systemTokens = systemMessage ? this.estimateTokens(systemMessage) : 0;

    for (const message of nonSystemMessages) {
      const messageTokens = this.estimateTokens(message);

      if (currentTokens + messageTokens + systemTokens > this.maxTokens && currentSegment.length > 0) {
        // ✅ Create segment with system message first, then conversation messages
        const segment: Message[] = [];
        if (systemMessage) {
          segment.push(systemMessage);
        }
        segment.push(...currentSegment);
        segments.push(segment);

        // Start new segment with overlap
        currentSegment = currentSegment.slice(-overlap);
        currentTokens = currentSegment.reduce((sum, msg) => sum + this.estimateTokens(msg), 0);
      }

      currentSegment.push(message);
      currentTokens += messageTokens;
    }

    // Add final segment
    if (currentSegment.length > 0) {
      const segment: Message[] = [];
      if (systemMessage) {
        segment.push(systemMessage);
      }
      segment.push(...currentSegment);
      segments.push(segment);
    }

    return segments;
  }
}

export const contextManager = new ContextManager();