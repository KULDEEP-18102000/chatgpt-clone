// File: src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/upload';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' }, 
        { status: 400 }
      );
    }

    console.log(`Uploading ${files.length} files to Cloudinary...`);

    // Upload all files to Cloudinary
    const uploadPromises = files.map(async (file) => {
      try {
        const cloudinaryUrl = await uploadToCloudinary(file);
        
        return {
          success: true,
          originalName: file.name,
          size: file.size,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: cloudinaryUrl,
          cloudinaryUrl: cloudinaryUrl
        };
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        return {
          success: false,
          originalName: file.name,
          error: error instanceof Error ? error.message : 'Upload failed'
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    // Separate successful and failed uploads
    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);

    console.log(`Upload results: ${successful.length} successful, ${failed.length} failed`);

    return NextResponse.json({
      successful,
      failed,
      message: `${successful.length} files uploaded successfully${failed.length > 0 ? `, ${failed.length} failed` : ''}`
    });

  } catch (error) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload' }, 
      { status: 500 }
    );
  }
}