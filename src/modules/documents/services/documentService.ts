import { PrismaClient } from '@prisma/client';
import type { DocumentProcessingStatus } from '@prisma/client';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { extractTextFromPdf } from '@/lib/pdfProcessor';
import { extractTextFromDocx } from '@/lib/docxProcessor';
import { saveFile, deleteFile, readFileContent } from '../actions/fileActions';
import type { Document, DocumentInput } from '../types';

const prisma = new PrismaClient();

// Client-side functions
export async function fetchUserDocuments(): Promise<Document[]> {
  try {
    const response = await fetch('/api/documents/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // Important for auth
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw new Error('Failed to fetch documents');
  }
}

export async function uploadDocument(formData: FormData): Promise<Document> {
  const response = await fetch('/api/documents', {
    method: 'POST',
    body: formData,
    // Add headers to indicate we're sending form data
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload document');
  }

  const data = await response.json();
  return data.document;
}

// Server-side functions
interface UploadDocumentParams {
  userId: string;
  title: string;
  description?: string;
  file: {
    name: string;
    type: string;
    size: number;
    path: string;
    buffer: Buffer;
  };
}

export async function uploadDocumentServer({
  userId,
  title,
  description,
  file,
}: UploadDocumentParams) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);

  // Save file using buffer
  await saveFile(file.buffer, filePath);

  // Create document in database
  const document = await prisma.document.create({
    data: {
      title,
      description,
      fileName: file.name,
      filePath: filePath,
      fileType: file.type,
      fileSize: file.size,
      processingStatus: 'PENDING',
      userId,
    },
  });

  // Process document text extraction asynchronously
  processDocument(document.id).catch((err) => {
    console.error(`Error processing document ${document.id}:`, err);
  });

  return document;
}

export async function getAllDocuments(userId: string, role: string) {
  // Admin can see all documents, users only see their own
  const where = role === 'admin' ? {} : { userId };

  const documents = await prisma.document.findMany({
    where,
    select: {
      id: true,
      title: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      processingStatus: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return documents;
}

export async function getDocumentById(id: string, userId: string, role: string) {
  // Check permissions
  const where = role === 'admin' 
    ? { id } 
    : { id, userId };

  const document = await prisma.document.findFirst({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return document;
}

export async function deleteDocument(id: string, userId: string, role: string) {
  // Check permissions
  const document = await prisma.document.findUnique({
    where: { id },
    select: { userId: true, filePath: true },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  if (document.userId !== userId && role !== 'admin') {
    throw new Error('You do not have permission to delete this document');
  }

  // Delete file using server action
  if (document.filePath) {
    await deleteFile(document.filePath);
  }

  // Delete document from database
  await prisma.document.delete({
    where: { id },
  });

  return { success: true, message: 'Document deleted successfully' };
}

async function processDocument(documentId: string) {
  try {
    // Mark document as processing
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: 'PROCESSING' },
    });

    // Get document details
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || !document.filePath) {
      throw new Error('Document not found or file path missing');
    }

    // Extract text based on file type
    let extractedText: any = null;
    
    const fileExtension = path.extname(document.filePath).toLowerCase();
    
    if (fileExtension === '.pdf') {
      extractedText = await extractTextFromPdf(document.filePath);
    } else if (['.docx', '.doc'].includes(fileExtension)) {
      extractedText = await extractTextFromDocx(document.filePath);
    } else if (fileExtension === '.txt') {
      const textContent = await readFileContent(document.filePath);
      extractedText = { text: textContent };
    } else {
      throw new Error('Unsupported file format');
    }

    // Update document with extracted content
    await prisma.document.update({
      where: { id: documentId },
      data: {
        content: extractedText,
        processingStatus: 'COMPLETED',
      },
    });
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    
    // Mark document as failed
    await prisma.document.update({
      where: { id: documentId },
      data: {
        processingStatus: 'FAILED',
      },
    });
    
    throw error;
  }
}

export async function updateDocument(
  id: string, 
  userId: string, 
  data: { title?: string; description?: string }
) {
  // Find the document first to verify ownership
  const document = await prisma.document.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!document) {
    throw new Error('Document not found or you do not have permission to update it');
  }

  return prisma.document.update({
    where: { id },
    data,
  });
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentProcessingStatus
) {
  return prisma.document.update({
    where: { id },
    data: { processingStatus: status },
  });
}

// Server-side API functions
export async function getAllUserDocuments(userId: string): Promise<Document[]> {
  try {
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return documents;
  } catch (error) {
    console.error('Error fetching user documents:', error);
    throw error;
  }
}

export async function createDocument(input: DocumentInput): Promise<Document> {
  try {
    return await prisma.document.create({
      data: {
        title: input.title,
        description: input.description,
        fileName: input.fileName,
        filePath: input.filePath,
        fileType: input.fileType,
        fileSize: input.fileSize,
        processingStatus: 'PENDING',
        user: { connect: { id: input.userId } },
      },
    });
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

export async function startDocumentProcessing(documentId: string): Promise<void> {
  try {
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        processingStatus: 'PROCESSING'
      },
    });

    // Simulate document processing (e.g., OCR, validation)
    await new Promise(resolve => setTimeout(resolve, 3000));

    await prisma.document.update({
      where: { id: documentId },
      data: { 
        processingStatus: 'COMPLETED',
        updatedAt: new Date() // Use updatedAt instead of processedAt
      },
    });
  } catch (error) {
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        processingStatus: 'FAILED',
        description: error instanceof Error ? error.message : 'Unknown error during processing' // Store error in description field
      },
    });
    throw error;
  }
}
