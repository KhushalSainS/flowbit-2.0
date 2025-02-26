'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  title: string;
  description?: string | null;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface DocumentFormData {
  title: string;
  description?: string;
  file: File;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/documents');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentById = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/documents/${id}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch document');
      }
      
      const data = await response.json();
      setCurrentDocument(data.document);
      return data.document;
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the document');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (formData: DocumentFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = new FormData();
      data.append('file', formData.file);
      data.append('title', formData.title);
      
      if (formData.description) {
        data.append('description', formData.description);
      }
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to upload document');
      }
      
      const result = await response.json();
      
      // Refresh document list
      fetchDocuments();
      
      return result.document;
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading the document');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (id: string, data: { title?: string; description?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update document');
      }
      
      const result = await response.json();
      
      // Update current document if it's the one being edited
      if (currentDocument && currentDocument.id === id) {
        setCurrentDocument(result.document);
      }
      
      // Refresh document list
      fetchDocuments();
      
      return result.document;
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the document');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete document');
      }
      
      // Remove from current documents list
      setDocuments(documents.filter(doc => doc.id !== id));
      
      // If current document is the one being deleted, clear it
      if (currentDocument && currentDocument.id === id) {
        setCurrentDocument(null);
      }
      
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the document');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load documents initially
  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    currentDocument,
    loading,
    error,
    fetchDocuments,
    fetchDocumentById,
    uploadDocument,
    updateDocument,
    deleteDocument,
  };
}

export default useDocuments;
