'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/chat/file-upload';
import { Attachment } from '@/types';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("attachments------>", attachments);
    console.log("message----->", message);
    
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      setShowFileUpload(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (newAttachments: Attachment[]) => {
    setAttachments([...attachments, ...newAttachments]);
    setShowFileUpload(false);
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  return (
    <div className="relative">
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center bg-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-gray-300 truncate max-w-[200px]">
                {attachment.name}
              </span>
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[50px] max-h-[200px] resize-none bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-12"
              disabled={disabled}
            />
            
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="absolute right-2 bottom-2 text-gray-400 hover:text-white cursor-pointer"
            >
              <Paperclip size={16} />
            </Button>
          </div>

          <Button
            type="submit"
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Send size={16} />
          </Button>
        </div>
      </form>

      {showFileUpload && (
        <div className="absolute bottom-full mb-2 left-0 right-0 cursor-pointer">
          <FileUpload onUpload={handleFileUpload} />
        </div>
      )}
    </div>
  );
}