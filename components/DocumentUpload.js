import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function DocumentUpload({ onDocumentUploaded }) {
  const { data: session } = useSession();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setFile(null);
        onDocumentUploaded();
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          className="mb-4"
        />
        <button 
          type="submit" 
          disabled={!file || isUploading}
          className={`mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
            !file || isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
}
