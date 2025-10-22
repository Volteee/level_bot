// app/api/files/[...path]/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Ожидаем параметры
    const { path: pathArray } = await params;
    
    // Получаем исходный путь к файлу
    const originalPath = path.join('/' + pathArray[0], ...pathArray.slice(1));
    
    console.log('Looking for file at:', originalPath);

    // Сначала проверяем существование файла по исходному пути
    let filePath = originalPath;
    let stats: fs.Stats;

    if (fs.existsSync(originalPath)) {
      stats = fs.statSync(originalPath);
    } else {
      // Если файл не найден, проверяем возможные расширения для изображений
      const possibleExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      let foundPath: string | null = null;

      for (const ext of possibleExtensions) {
        const testPath = originalPath + ext;
        if (fs.existsSync(testPath)) {
          foundPath = testPath;
          break;
        }
      }

      if (!foundPath) {
        console.log('File not found at:', originalPath, 'and no extensions tried');
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      filePath = foundPath;
      stats = fs.statSync(filePath);
    }

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
    
    // Если расширение не найдено, пытаемся определить тип по содержимому
    let contentType = mimeTypes[ext];
    if (!contentType) {
      // Простая проверка сигнатур файлов
      if (fileBuffer.length >= 3) {
        const header = fileBuffer.slice(0, 3);
        if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
          contentType = 'image/jpeg';
        } else if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E) {
          contentType = 'image/png';
        } else if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
          contentType = 'image/gif';
        } else {
          contentType = 'application/octet-stream';
        }
      } else {
        contentType = 'application/octet-stream';
      }
    }
    
    // Возвращаем файл
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}