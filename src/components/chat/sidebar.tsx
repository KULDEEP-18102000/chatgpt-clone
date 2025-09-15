"use client";

import { useState } from "react";
import { Plus, Menu, X, MessageSquare, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  onNewConversation: () => void;
  loadConversation: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  deleteConversation,
  loadUserConversations,
  onNewConversation,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleEditStart = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = async (conversationId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await fetch(`/api/conversations/${conversationId}?userId=${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      setEditingId(null);
      loadUserConversations();
      // You might want to refresh conversations here
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    deleteConversation(conversationId);

    // const user = JSON.parse(localStorage.getItem('user') || '{}');

    // try {
    //   await fetch(`/api/conversations/${conversationId}?userId=${user?.id}`, {
    //     method: 'DELETE',
    //   });
    //   // Refresh conversations or handle state update
    // } catch (error) {
    //   console.error('Error deleting conversation:', error);
    // }
  };

  const formatTitle = (title: string) => {
    if (title.length > 30) {
      return title.substring(0, 30) + "...";
    }
    return title;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile menu button */}
      <Button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
        size="sm"
      >
        <Menu size={18} />
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-700 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-white font-semibold text-lg">Chat History</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggle}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <X size={18} />
            </Button>
          </div>

          {/* New conversation button */}
          <div className="p-4">
            <Button
              onClick={onNewConversation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              <Plus size={16} className="mr-2" />
              New Chat
            </Button>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                <p className="text-gray-400 text-sm">No conversations yet</p>
                <p className="text-gray-500 text-xs mt-1">
                  Start a new chat to begin
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group relative rounded-lg transition-all duration-200 ${
                      currentConversationId === conversation.id
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <div
                      onClick={() => onSelectConversation(conversation.id)}
                      className="flex items-center space-x-3 p-3 cursor-pointer w-full"
                    >
                      <MessageSquare
                        size={16}
                        className="flex-shrink-0 text-gray-400"
                      />
                      <div className="flex-1 min-w-0">
                        {editingId === conversation.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleEditSave(conversation.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleEditSave(conversation.id);
                              } else if (e.key === "Escape") {
                                handleEditCancel();
                              }
                            }}
                            className="bg-gray-600 text-white text-sm rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div>
                            <p className="text-sm font-medium truncate">
                              {formatTitle(conversation.title)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {formatDate(conversation.updatedAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {editingId !== conversation.id && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleEditStart(conversation, e)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-600 cursor-pointer"
                          >
                            <Edit3 size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDelete(conversation.id, e)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-600 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 p-4">
            <div className="text-xs text-gray-500 text-center">
              <p>ChatGPT Clone</p>
              <p className="mt-1">Powered by Vercel AI</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
