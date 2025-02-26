'use client';

import { Document } from '../modules/documents/types';
import { formatBytes, formatDate } from '../utils/formatting';

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const getStatusBadge = () => {
    switch (document.processingStatus) {
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">Pending</span>;
      case 'PROCESSING':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Processing</span>;
      case 'COMPLETED':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Completed</span>;
      case 'FAILED':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">Failed</span>;
      default:
        return null;
    }
  };

  const getFileIcon = () => {
    if (document.fileType.includes('pdf')) {
      return '📄';
    } else if (document.fileType.includes('image')) {
      return '🖼️';
    } else if (document.fileType.includes('word') || document.fileType.includes('doc')) {
      return '📝';
    } else {
      return '📁';
    }
  };

  const handleDownload = () => {
    // Use the window.document object instead of the document prop
    const link = window.document.createElement('a');
    link.href = document.filePath;
    link.download = document.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{document.title}</h3>
          {getStatusBadge()}
        </div>
        
        {document.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{document.description}</p>
        )}
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <span className="mr-2 text-xl">{getFileIcon()}</span>
          <span className="truncate">{document.fileName}</span>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Size: {formatBytes(document.fileSize)}</span>
          <span>Uploaded: {formatDate(document.createdAt)}</span>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        <a 
          href={document.filePath} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Document
        </a>
        
        <button 
          className="text-gray-600 hover:text-gray-800 text-sm"
          title="Download document"
          onClick={handleDownload}
        >
          Download
        </button>
      </div>
    </div>
  );
}
