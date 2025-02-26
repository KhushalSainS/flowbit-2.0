import { PrismaClient, DocumentProcessingStatus } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function getAllUserDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDocumentById(id: string, userId: string) {
  return prisma.document.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function createDocument(documentData: {
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  userId: string;
}) {
  return prisma.document.create({
    data: documentData,
  });
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

export async function deleteDocument(id: string, userId: string) {
  // Find the document first to verify ownership
  const document = await prisma.document.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!document) {
    throw new Error('Document not found or you do not have permission to delete it');
  }

  // Delete the actual file
  try {
    const filePath = path.join(process.cwd(), 'public', document.filePath);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Continue with document deletion even if file deletion fails
  }

  // Delete the document record
  return prisma.document.delete({
    where: { id },
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

export async function startDocumentProcessing(id: string) {
  // Update document status to PROCESSING
  await updateDocumentStatus(id, 'PROCESSING');
  
  try {
    // Simulating document processing (in a real app, this might be a separate service)
    setTimeout(async () => {
      // Update status to COMPLETED after processing
      await updateDocumentStatus(id, 'COMPLETED');
    }, 5000); // Simulate 5 seconds of processing
    
    return true;
  } catch (error) {
    // If processing fails, update status to FAILED
    await updateDocumentStatus(id, 'FAILED');
    throw error;
  }
}
