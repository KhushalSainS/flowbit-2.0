'use client';

import { useState, FormEvent } from 'react';
import { uploadDocument } from '@/modules/documents/services/documentService';
import { Document } from '@/modules/documents/types';

interface UploadDocumentFormProps {
  onDocumentUploaded: (document: Document) => void;
}

export function UploadDocumentForm({ onDocumentUploaded }: UploadDocumentFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('title', title || file.name);
      formData.append('description', description);
      formData.append('file', file);
      
      const document = await uploadDocument(formData);
      onDocumentUploaded(document);
      
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      // Reset file input by using the global document object
      const fileInput = window.document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title (optional)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title (defaults to filename if empty)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description of your document"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
          File *
        </label>
        <input
          type="file"
          id="file-upload"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Supported file types: PDF, DOCX, JPG, PNG (max 10MB)
        </p>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
          loading ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
}
