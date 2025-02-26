'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DocumentCard } from '../components/DocumentCard';
import { UploadDocumentForm } from '../components/UploadDocumentForm';
import { Document } from '../modules/documents/types';
import { fetchUserDocuments } from '../modules/documents/services/documentService';

export default function HomeClient() {
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocuments() {
      if (status === 'loading') return;
      if (!session) {
        setError('Please sign in to view your documents');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const docs = await fetchUserDocuments();
        setDocuments(docs);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load documents');
        console.error('Error loading documents:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [session, status]);

  const handleDocumentUploaded = (document: Document) => {
    setDocuments(prevDocs => [document, ...prevDocs]);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading your documents...</p>
      </div>
    );
  }

  return (
    <>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Upload New Document</h2>
        <UploadDocumentForm onDocumentUploaded={handleDocumentUploaded} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Documents</h2>
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't uploaded any documents yet. Use the form above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
