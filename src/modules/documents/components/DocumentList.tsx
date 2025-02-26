'use client';

import { useState } from 'react';
import Link from 'next/link';
import useDocuments from '../hooks/useDocuments';

export function DocumentList() {
  const { documents, loading, error, deleteDocument } = useDocuments();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDeletingId(id);
      await deleteDocument(id);
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading documents...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">No documents found.</p>
        <Link 
          href="/documents/upload"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload your first document
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Documents</h2>
        <Link
          href="/documents/upload"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload New
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="border rounded-lg shadow-sm p-4 bg-white"
          >
            <div className="flex justify-between items-start">
              <div className="mb-2">
                <h3 className="font-semibold text-lg">{doc.title}</h3>
                <p className="text-gray-500 text-sm">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <span className={`px-2 py-1 text-xs rounded-full ${
                doc.processingStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                doc.processingStatus === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                doc.processingStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {doc.processingStatus}
              </span>
            </div>
            
            {doc.description && (
              <p className="text-gray-600 text-sm mt-2">{doc.description}</p>
            )}
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t">
              <div className="text-sm text-gray-500">
                {(doc.fileSize / 1024).toFixed(1)} KB
              </div>
              
              <div className="flex space-x-2">
                <Link
                  href={`/documents/${doc.id}`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  View
                </Link
                
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="text-red-500 hover:text-red-700"
                >
                  {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DocumentList;
