// app/api/files/[...path]/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // Получаем полный путь к файлу
    const filePath = path.join(process.cwd(), ...params.path);
    
    console.log('Looking for file at:', filePath); // Для отладки
    
    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      console.log('File not found at:', filePath);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Получаем статистику файла
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: 'Not a file' }, { status: 400 });
    }

    // Читаем файл
    const fileBuffer = fs.readFileSync(filePath);
    
    // Определяем MIME тип по расширению
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Возвращаем файл
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
        'Cache-Control': 'public, max-age=3600', // Кэшируем на 1 час
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}