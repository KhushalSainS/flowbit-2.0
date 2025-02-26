import type { DocumentProcessingStatus } from '@prisma/client';

export interface Document {
  id: string;
  title: string;
  description?: string | null;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  content?: any | null;
  processingStatus: DocumentProcessingStatus;
  error?: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  processedAt?: Date | null;
}

export interface DocumentInput {
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  userId: string;
}
