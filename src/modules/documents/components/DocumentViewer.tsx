'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useDocuments from '../hooks/useDocuments';

interface DocumentViewerProps {
  id?: string;
}

export function DocumentViewer({ id }: DocumentViewerProps) {
  const params = useParams();
  const documentId = id || (params?.id as string);
  const { fetchDocumentById, currentDocument, loading, error, updateDocument, deleteDocument } = useDocuments();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (documentId) {
      fetchDocumentById(documentId);
    }
  }, [documentId]);

  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title);
      setDescription(currentDocument.description || '');
    }
  }, [currentDocument]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (currentDocument) {
      setTitle(currentDocument.title);
      setDescription(currentDocument.description || '');
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (documentId) {
      await updateDocument(documentId, {
        title,
        description,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (documentId && confirm('Are you sure you want to delete this document?')) {
      const success = await deleteDocument(documentId);
      if (success) {
        router.push('/documents');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading document...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!currentDocument) {
    return <div className="text-center p-8">Document not found</div>;
  }

  const renderDocumentPreview = () => {
    const { fileType, filePath } = currentDocument;
    
    if (fileType.startsWith('image/')) {
      return (
        <div className="mt-6 flex justify-center">
          <img 
            src={filePath} 
            alt={currentDocument.title}
            className="max-w-full max-h-[500px] object-contain" 
          />
        </div>
      );
    }
    
    if (fileType === 'application/pdf') {
      return (
        <div className="mt-6 h-[600px]">
          <iframe 
            src={filePath} 
            className="w-full h-full border-0"
            title={currentDocument.title}
          />
        </div>
      );
    }
    
    return (
      <div className="mt-6 text-center">
        <p className="mb-4">Preview not available for this file type.</p>
        <a 
          href={filePath} 
          download
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/documents" className="text-blue-500 hover:text-blue-700">
          ← Back to Documents
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-bold mb-2 p-2 border rounded"
              />
            ) : (
              <h1 className="text-2xl font-bold mb-2">{currentDocument.title}</h1>
            )}
            
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span>Uploaded on {new Date(currentDocument.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{(currentDocument.fileSize / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                currentDocument.processingStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                currentDocument.processingStatus === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                currentDocument.processingStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {currentDocument.processingStatus}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
          ) : (
            <p className="text-gray-700">{currentDocument.description || 'No description provided'}</p>
          )}
        </div>
        
        {renderDocumentPreview()}
      </div>
    </div>
  );
}
