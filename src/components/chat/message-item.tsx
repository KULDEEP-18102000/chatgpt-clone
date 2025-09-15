"use client";

import { useState } from "react";
import { Edit2, Check, X, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/types";
import Image from "next/image";

interface MessageItemProps {
  message: Message;
  onEdit: (messageId: string, newContent: string) => void;
}

export function MessageItem({ message, onEdit }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSave = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div
        className={`flex max-w-3xl ${
          isUser ? "flex-row-reverse" : "flex-row"
        } items-start space-x-3`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hidden ${
            isUser ? "bg-gray-700 ml-3" : "bg-gray-600 mr-3"
          }`}
        >
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-white" />
          )}
        </div>

        <div
          className={`rounded-lg p-4 ${
            isUser
              ? "bg-gray-100 text-gray-900 border border-gray-200"
              : "bg-white text-gray-900 border border-transparent"
          }`}
        >
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] bg-white border-gray-300 text-gray-900"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="rounded p-2 border border-gray-300 bg-white"
                    >
                      {attachment.type === "image" ? (
                        <Image
                          src={attachment.url}
                          alt={attachment.name}
                          width={200}
                          height={200}
                          className="max-w-full h-auto rounded"
                        />
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          {attachment.name}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {isUser && !isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <Edit2 size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
