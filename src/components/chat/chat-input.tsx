'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Attachment } from '@/types';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // ✅ Reference to hidden file input

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("attachments------>", attachments);
    console.log("message----->", message);
        
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // ✅ Direct file upload handler
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file picker directly
    }
  };

  // ✅ Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Create attachment object
      const attachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file), // Create temporary URL for preview
        file: file, // Store the actual file object if needed
      };

      newAttachments.push(attachment);
    }

    setAttachments([...attachments, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (attachmentId: string) => {
    // Clean up object URLs to prevent memory leaks
    const attachmentToRemove = attachments.find(a => a.id === attachmentId);
    if (attachmentToRemove?.url) {
      URL.revokeObjectURL(attachmentToRemove.url);
    }
    
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  // ✅ Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative">
      {/* ✅ Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center bg-gray-700 rounded-lg px-3 py-2 text-sm group hover:bg-gray-600 transition-colors"
            >
              {/* File icon based on type */}
              <div className="flex items-center space-x-2">
                {attachment.type === 'image' ? (
                  <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">IMG</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">FILE</span>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className="text-gray-300 truncate max-w-[200px] text-xs">
                    {attachment.name}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {formatFileSize(attachment.size)}
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeAttachment(attachment.id)}
                className="ml-2 p-1 h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-600"
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv" // Specify allowed file types
        onChange={handleFileChange}
        className="hidden"
      />

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
                        
            {/* ✅ Direct file upload button */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAttachmentClick}
              disabled={disabled}
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
    </div>
  );
}