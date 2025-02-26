import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { getAllUserDocuments, createDocument, startDocumentProcessing } from '../services/documentService';

const prisma = new PrismaClient();

// GET handler to retrieve all documents for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const documents = await getAllUserDocuments(user.id);
    
    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST handler to upload a new document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }
    
    // Check file size
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'); // Default to 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds the maximum limit' },
        { status: 400 }
      );
    }
    
    // Extract file info
    const title = formData.get('title') as string || file.name;
    const description = formData.get('description') as string || '';
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    
    // Create relative path for storage
    const uniqueFilename = `${Date.now()}-${fileName}`;
    const relativeFilePath = `/assets/uploads/${uniqueFilename}`;
    const absoluteFilePath = join(process.cwd(), 'public', relativeFilePath);
    
    // Ensure directory exists
    await mkdir(dirname(absoluteFilePath), { recursive: true });
    
    // Save the file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absoluteFilePath, buffer);
    
    // Create document record
    const document = await createDocument({
      title,
      description,
      fileName,
      filePath: relativeFilePath,
      fileType,
      fileSize,
      userId: user.id,
    });
    
    // Start processing the document (async)
    startDocumentProcessing(document.id).catch(error => {
      console.error(`Error processing document ${document.id}:`, error);
    });
    
    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}
