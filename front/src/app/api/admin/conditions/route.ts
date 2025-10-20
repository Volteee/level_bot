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

    // Валидация данных
    if (!conditions || typeof conditions !== 'object') {
      return NextResponse.json(
        { error: 'Invalid conditions data' },
        { status: 400 }
      );
    }

    const requiredFields = [
      'first_low', 'first_high', 'second_low', 'second_high', 
      'third_low', 'third_high', 'forth_low'
    ];

    for (const field of requiredFields) {
      if (typeof conditions[field] !== 'number' || conditions[field] < 0) {
        return NextResponse.json(
          { error: `Invalid value for field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Дополнительная валидация бизнес-логики
    if (conditions.first_low >= conditions.first_high) {
      return NextResponse.json(
        { error: 'First level: верхняя граница должна быть больше нижней' },
        { status: 400 }
      );
    }

    if (conditions.second_low >= conditions.second_high) {
      return NextResponse.json(
        { error: 'Second level: верхняя граница должна быть больше нижней' },
        { status: 400 }
      );
    }

    if (conditions.third_low >= conditions.third_high) {
      return NextResponse.json(
        { error: 'Third level: верхняя граница должна быть больше нижней' },
        { status: 400 }
      );
    }

    if (conditions.first_high !== conditions.second_low) {
      return NextResponse.json(
        { error: 'Диапазоны должны быть непрерывными между уровнями 1 и 2' },
        { status: 400 }
      );
    }

    if (conditions.second_high !== conditions.third_low) {
      return NextResponse.json(
        { error: 'Диапазоны должны быть непрерывными между уровнями 2 и 3' },
        { status: 400 }
      );
    }

    if (conditions.third_high !== conditions.forth_low) {
      return NextResponse.json(
        { error: 'Диапазоны должны быть непрерывными между уровнями 3 и 4' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ 
      success: true,
      message: 'Условия успешно сохранены'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving conditions:', error);
    return NextResponse.json(
      { error: 'Failed to save conditions' }, 
      { status: 500 }
    );
  } finally {
    client.release();
  }
}