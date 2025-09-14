import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { uploadToCloudinary, isImageFile, isTextFile } from '@/lib/upload';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const url = await uploadToCloudinary(file);
        
        return {
          id: crypto.randomUUID(),
          type: isImageFile(file.type) ? 'image' : 'file',
          url,
          name: file.name,
          size: file.size,
          mimeType: file.type,
        };
      })
    );

    return NextResponse.json(uploadResults);
  } catch (error) {
    console.error('Upload API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}