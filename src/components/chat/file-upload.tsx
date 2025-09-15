// src/components/chat/file-upload.tsx
'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Attachment } from '@/types';
import { uploadFile } from '@uploadcare/upload-client';

interface FileUploadProps {
  onUpload: (attachments: Attachment[]) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const attachments = await Promise.all(
        Array.from(files).map(async (file) => {
          const result = await uploadFile(file, {
            publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY!,
            fileName: file.name,
            metadata: {
              subsystem: 'chatgpt-clone',
              originalName: file.name,
              uploadedAt: new Date().toISOString()
            }
          });

          return {
            id: result.uuid,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            url: result.cdnUrl,
            name: file.name,
            size: file.size,
            mimeType: file.type,
          } as Attachment;
        })
      );

      onUpload(attachments);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging
          ? 'border-blue-400 bg-blue-50 bg-opacity-10'
          : 'border-gray-600 bg-gray-700'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
    >
      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
      
      <div className="text-gray-300 mb-3">
        <p className="text-sm">
          {uploading ? 'Uploading...' : 'Drag and drop files here, or click to select'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supports images, PDFs, documents, and more
        </p>
      </div>

      <input
        type="file"
        multiple
        onChange={handleFileInput}
        disabled={uploading}
        className="hidden"
        id="file-upload"
        accept="image/*,.pdf,.txt,.doc,.docx,.csv,.json"
      />
      
      <label
        htmlFor="file-upload"
        className="inline-block cursor-pointer"
      >
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          className="border-gray-600 text-gray-300 hover:bg-gray-600"
        >
          {uploading ? 'Uploading...' : 'Choose Files'}
        </Button>
      </label>
    </div>
  );
}