"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./message-item";
import { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage: (messageId: string, newContent: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  onEditMessage,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-4">
              ChatGPT Clone
            </h1>
            <p className="text-gray-400">How can I help you today?</p>
          </div>
        ) : (
          <div className="space-y-8">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onEdit={onEditMessage}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-4 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
