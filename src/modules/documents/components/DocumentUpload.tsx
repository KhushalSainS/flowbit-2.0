'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import useDocuments from '../hooks/useDocuments';

export function DocumentUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const { uploadDocument, loading, error } = useDocuments();
  const router = useRouter();
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setFileError('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
    
    // Auto-fill title if empty
    if (!title && selectedFile.name) {
      // Remove file extension for the title
      const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
      setTitle(fileName || selectedFile.name);
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }
    
    try {
      const result = await uploadDocument({
        title,
        description,
        file,
      });
      
      if (result) {
        router.push('/documents');
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Document</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="file" className="block mb-2 font-medium">
            Document File*
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2.5"
            required
          />
          {fileError && (
            <p className="mt-2 text-sm text-red-600">{fileError}</p>
          )}
          {file && (
            <p className="mt-2 text-sm text-gray-500">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="title" className="block mb-2 font-medium">
            Title*
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block mb-2 font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50">
            {error}
          </div>
        )}
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !file}
            className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default DocumentUpload;
