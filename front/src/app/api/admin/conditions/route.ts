// app/api/admin/conditions/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: Request) {
  const client = await pool.connect();
  try {
    const { conditions } = await request.json();

    await client.query('BEGIN');

    // Проверяем существование конфига
    const checkResult = await client.query(
      'SELECT key FROM configs WHERE key = $1',
      ['relation_conditions']
    );

    if (checkResult.rows.length > 0) {
      // Обновляем существующий конфиг
      await client.query(
        'UPDATE configs SET data = $1 WHERE key = $2',
        [conditions, 'relation_conditions']
      );
    } else {
      // Создаем новый конфиг
      await client.query(
        'INSERT INTO configs (key, data) VALUES ($1, $2)',
        ['relation_conditions', conditions]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving conditions:', error);
    return NextResponse.json({ error: 'Failed to save conditions' }, { status: 500 });
  } finally {
    client.release();
  }
}