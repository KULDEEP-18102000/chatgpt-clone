'use client';

import { useState, useRef, useEffect } from 'react';
import { X, FileText, Send, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface LargeTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendAsMessage: (text: string, summary?: string) => void;
  initialText: string;
  title?: string;
}

export function LargeTextModal({ 
  isOpen, 
  onClose, 
  onSendAsMessage, 
  initialText,
  title = "Large Text Content"
}: LargeTextModalProps) {
  const [text, setText] = useState(initialText);
  const [summary, setSummary] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(initialText);
    // Auto-generate a summary from first few words
    if (initialText) {
      const words = initialText.trim().split(/\s+/);
      const summaryText = words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');
      setSummary(summaryText);
    }
  }, [initialText]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (text.trim()) {
      onSendAsMessage(text.trim(), summary);
      onClose();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      // You could show a toast notification here
      console.log('Text copied to clipboard');
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pasted-text-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;
  const lineCount = text.split('\n').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{title}</h3>
              <p className="text-gray-400 text-sm">
                {wordCount} words • {charCount} characters • {lineCount} lines
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-gray-400 hover:text-white"
            >
              <Copy size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-gray-400 hover:text-white"
            >
              <Download size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Summary Input */}
        <div className="p-4 border-b border-gray-600">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Summary (optional - will be shown in chat)
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief description of this content..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Text Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your large text content..."
            className="w-full h-full min-h-[300px] bg-gray-700 border border-gray-600 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-600">
          <div className="text-gray-400 text-sm">
            This content will be sent as a message to the AI
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!text.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send size={16} className="mr-2" />
              Send to Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}