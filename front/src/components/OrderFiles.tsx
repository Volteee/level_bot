// components/OrderFiles.tsx
'use client';

import { File, FileMediaTypeEnum } from '@/types/user';
import { useState } from 'react';

interface OrderFilesProps {
  files: File[];
}

export default function OrderFiles({ files }: OrderFilesProps) {
  const [expanded, setExpanded] = useState(false);

  const getFileIcon = (mediaType: FileMediaTypeEnum) => {
    switch (mediaType) {
      case FileMediaTypeEnum.PHOTO:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case FileMediaTypeEnum.VIDEO:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case FileMediaTypeEnum.DOCUMENT:
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getFileTypeName = (mediaType: FileMediaTypeEnum) => {
    const names = {
      [FileMediaTypeEnum.DOCUMENT]: 'Документ',
      [FileMediaTypeEnum.PHOTO]: 'Фото',
      [FileMediaTypeEnum.VIDEO]: 'Видео',
    };
    return names[mediaType];
  };

  const getFileNameFromPath = (path: string) => {
    // Убираем префикс data/files/ если он есть
    const cleanPath = path.replace(/^data\/files\//, '');
    return cleanPath.split('/').pop() || cleanPath;
  };

  const getFileUrl = (path: string, mediaType: FileMediaTypeEnum) => {
    // Для фото файлов без расширения добавляем .jpg
    if (mediaType === FileMediaTypeEnum.PHOTO) {
      const fileName = getFileNameFromPath(path);
      const hasExtension = fileName.includes('.');
      
      if (!hasExtension) {
        // Добавляем .jpg к пути, если у файла нет расширения
        const pathWithoutFile = path.substring(0, path.lastIndexOf('/') + 1);
        const fileWithoutExtension = path.substring(path.lastIndexOf('/') + 1);
        return `/api/files/${pathWithoutFile}${fileWithoutExtension}.jpg`;
      }
    }
    
    // Используем API endpoint для файлов
    // Путь из базы данных уже содержит data/files/, поэтому используем как есть
    return `/api/files/${path}`;
  };

  const getFilePreview = (file: File) => {
    if (file.media_type === FileMediaTypeEnum.PHOTO) {
      return (
        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
          <img 
            src={getFileUrl(file.path, file.media_type)} 
            alt={getFileNameFromPath(file.path)}
            className="w-full h-full object-cover rounded"
            onError={(e) => {
              // Если изображение не загружается, показываем иконку
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      );
    }
    return null;
  };

  if (files.length === 0) {
    return null;
  }

  const displayedFiles = expanded ? files : files.slice(0, 2);
  const hasMoreFiles = files.length > 2;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-600 font-medium flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <span>Файлы ({files.length})</span>
        </div>
        
        {hasMoreFiles && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {expanded ? 'Скрыть' : `Еще +${files.length - 2}`}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayedFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Превью для фото */}
            {file.media_type === FileMediaTypeEnum.PHOTO && getFilePreview(file)}
            
            <div className={`p-2 rounded ${
              file.media_type === FileMediaTypeEnum.PHOTO ? 'bg-blue-100 text-blue-600' :
              file.media_type === FileMediaTypeEnum.VIDEO ? 'bg-purple-100 text-purple-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {getFileIcon(file.media_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-gray-900 truncate">
                  {getFileNameFromPath(file.path)}
                </span>
                <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-white rounded border">
                  {getFileTypeName(file.media_type)}
                </span>
              </div>
              <div className="text-xs text-gray-400 truncate">
                {file.path}
              </div>
            </div>
            
            <a
              href={getFileUrl(file.path, file.media_type)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Открыть
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}