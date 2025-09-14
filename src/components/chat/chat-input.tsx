'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
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
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false); // NEW: Drag state
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // NEW: Handle clipboard paste for images
  const handlePaste = async (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = Array.from(clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length === 0) return;

    // Prevent default paste behavior for images
    e.preventDefault();
    
    console.log(`Pasting ${imageItems.length} image(s) from clipboard`);

    const files: File[] = [];
    
    // Convert clipboard items to files
    for (const item of imageItems) {
      const file = item.getAsFile();
      if (file) {
        // Create a more descriptive filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = file.type.split('/')[1] || 'png';
        const filename = `pasted-image-${timestamp}.${extension}`;
        
        // Create a new file with a better name
        const renamedFile = new File([file], filename, { type: file.type });
        files.push(renamedFile);
      }
    }

    if (files.length > 0) {
      // Process pasted files the same way as uploaded files
      await processFiles(files);
    }
  };

  // NEW: Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    console.log(`Dropped ${files.length} file(s)`);
    await processFiles(files);
  };

  // Direct file upload handler
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Upload files to Cloudinary
  const uploadFilesToCloudinary = async (files: File[]) => {
    const formData = new FormData();
    
    // Add all files to form data
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // NEW: Extracted file processing logic to be reused for upload, paste, and drag & drop
  const processFiles = async (files: File[]) => {
    // Create temporary attachments with loading state
    const tempAttachments: Attachment[] = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: '', // Will be populated after upload
      file: file,
      uploading: true,
    }));

    // Add temporary attachments to state
    setAttachments(prev => [...prev, ...tempAttachments]);
    
    // Track uploading files
    const uploadingIds = tempAttachments.map(att => att.id);
    setUploadingFiles(prev => [...prev, ...uploadingIds]);

    try {
      // Upload to Cloudinary
      console.log('Uploading files to Cloudinary...');
      const uploadResult = await uploadFilesToCloudinary(files);
      
      console.log('Upload result:', uploadResult);

      // Update attachments with Cloudinary URLs
      setAttachments(prev => {
        return prev.map(attachment => {
          if (uploadingIds.includes(attachment.id)) {
            // Find corresponding successful upload
            const successfulUpload = uploadResult.successful.find(
              (upload: any) => upload.originalName === attachment.name
            );
            
            if (successfulUpload) {
              return {
                ...attachment,
                url: successfulUpload.cloudinaryUrl,
                uploading: false,
              };
            } else {
              // Handle failed upload
              console.error(`Failed to upload ${attachment.name}`);
              return {
                ...attachment,
                uploading: false,
                uploadFailed: true,
              };
            }
          }
          return attachment;
        });
      });

      // Remove from uploading list
      setUploadingFiles(prev => prev.filter(id => !uploadingIds.includes(id)));

      // Show success message if there were failed uploads
      if (uploadResult.failed && uploadResult.failed.length > 0) {
        console.warn('Some files failed to upload:', uploadResult.failed);
      }

    } catch (error) {
      console.error('Upload error:', error);
      
      // Mark all uploads as failed
      setAttachments(prev => {
        return prev.map(attachment => {
          if (uploadingIds.includes(attachment.id)) {
            return {
              ...attachment,
              uploading: false,
              uploadFailed: true,
            };
          }
          return attachment;
        });
      });
      
      setUploadingFiles(prev => prev.filter(id => !uploadingIds.includes(id)));
    }
  };

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    await processFiles(filesArray);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (attachmentId: string) => {
    // Clean up object URLs to prevent memory leaks (if any local URLs exist)
    const attachmentToRemove = attachments.find(a => a.id === attachmentId);
    if (attachmentToRemove?.url && attachmentToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachmentToRemove.url);
    }
    
    setAttachments(attachments.filter(a => a.id !== attachmentId));
    setUploadingFiles(prev => prev.filter(id => id !== attachmentId));
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={`flex items-center rounded-lg px-3 py-2 text-sm group transition-colors ${
                attachment.uploading 
                  ? 'bg-blue-700/50 border border-blue-500' 
                  : attachment.uploadFailed
                  ? 'bg-red-700/50 border border-red-500'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {/* File icon based on type */}
              <div className="flex items-center space-x-2">
                {attachment.uploading ? (
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-blue-400" />
                  </div>
                ) : attachment.uploadFailed ? (
                  <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                ) : attachment.type === 'image' ? (
                  <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">IMG</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">FILE</span>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className={`truncate max-w-[200px] text-xs ${
                    attachment.uploading 
                      ? 'text-blue-300' 
                      : attachment.uploadFailed
                      ? 'text-red-300'
                      : 'text-gray-300'
                  }`}>
                    {attachment.name}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {attachment.uploading 
                      ? 'Uploading...' 
                      : attachment.uploadFailed
                      ? 'Upload failed'
                      : formatFileSize(attachment.size)
                    }
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeAttachment(attachment.id)}
                className="ml-2 p-1 h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-600"
                disabled={attachment.uploading}
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv"
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
              onPaste={handlePaste} // NEW: Clipboard paste support
              onDragOver={handleDragOver} // NEW: Drag and drop support
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              placeholder="Type your message, paste images (Ctrl+V), or drag & drop files..."
              className={`min-h-[50px] max-h-[200px] resize-none border-gray-600 text-white placeholder-gray-400 pr-12 transition-colors ${
                isDragOver 
                  ? 'bg-blue-700/30 border-blue-500 border-2' 
                  : 'bg-gray-700 border-gray-600'
              }`}
              disabled={disabled}
            />
                        
            {/* Direct file upload button */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAttachmentClick}
              disabled={disabled || uploadingFiles.length > 0}
              className="absolute right-2 bottom-2 text-gray-400 hover:text-white cursor-pointer"
            >
              {uploadingFiles.length > 0 ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Paperclip size={16} />
              )}
            </Button>
          </div>

          <Button
            type="submit"
            disabled={
              disabled || 
              (!message.trim() && attachments.length === 0) ||
              uploadingFiles.length > 0 || // Disable send while uploading
              attachments.some(att => att.uploadFailed) // Disable if any uploads failed
            }
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
}