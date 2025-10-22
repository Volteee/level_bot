// components/OrderFiles.tsx
'use client';

import { File, FileMediaTypeEnum } from '@/types/user';
import { useState } from 'react';

interface OrderFilesProps {
  files: File[];
}

export default function OrderFiles({ files }: OrderFilesProps) {
  const [expanded, setExpanded] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const getFileUrl = (path: string) => {
    return `/api/files/${path}`;
  };

  const handleImageError = (fileId: string) => {
    setFailedImages(prev => new Set(prev).add(fileId));
  };

  const getFilePreview = (file: File) => {
    if (file.media_type === FileMediaTypeEnum.PHOTO && !failedImages.has(file.id)) {
      return (
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
          <img 
            src={getFileUrl(file.path)} 
            alt="Превью заявки"
            className="w-full h-full object-cover"
            onError={() => handleImageError(file.id)}
            loading="lazy"
          />
        </div>
      );
    }
    
    // Показываем placeholder если изображение не загрузилось или это не фото
    return (
      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        {file.media_type === FileMediaTypeEnum.VIDEO ? (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ) : file.media_type === FileMediaTypeEnum.PHOTO ? (
          // Placeholder для фото, которые не загрузились
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
    );
  };

  if (files.length === 0) {
    return null;
  }

  const displayedFiles = expanded ? files : files.slice(0, 3);
  const hasMoreFiles = files.length > 3;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-600 font-medium">
          Прикрепленные файлы ({files.length})
        </div>
        
        {hasMoreFiles && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {expanded ? 'Скрыть' : `Показать все`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {displayedFiles.map((file) => (
          <a
            key={file.id}
            href={getFileUrl(file.path)}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {getFilePreview(file)}
          </a>
        ))}
      </div>
    </div>
  );
}