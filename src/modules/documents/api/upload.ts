import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadDocumentServer } from '../services/documentService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Process document upload
    const document = await uploadDocumentServer({
      userId: session.user.id,
      title: title || file.name,
      description: description,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        buffer: Buffer.from(await file.arrayBuffer()),
        path: `uploads/${file.name}`
      },
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        processingStatus: document.processingStatus
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}
