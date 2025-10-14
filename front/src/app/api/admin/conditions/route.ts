// app/api/admin/conditions/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAuth } from '@/utils/check_auth';

export async function GET(request: Request) {
  const resp = await checkAuth(request)
  if (resp) {
    return resp
  }
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT data FROM configs WHERE key = $1',
      ['relation_conditions']
    );

    if (result.rows.length === 0) {
      // Возвращаем значения по умолчанию, если конфиг не найден
      const defaultConditions = {
        first_low: 0,
        first_high: 2000,
        second_low: 2000,
        second_high: 20000,
        third_low: 20000,
        third_high: 40000,
        forth_low: 40000,
      };
      return NextResponse.json(defaultConditions);
    }

    return NextResponse.json(result.rows[0].data);
  } catch (error) {
    console.error('Error fetching conditions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conditions' }, 
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(request: Request) {
  const resp = await checkAuth(request)
  if (resp) {
    return resp
  }
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