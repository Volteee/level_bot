// app/admin/conditions/page.tsx
import pool from '@/lib/db';
import { LevelConditions } from '@/types/config';
import ConditionsClient from './ConditionsClient';

async function getLevelConditions(): Promise<LevelConditions | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT data FROM configs WHERE key = $1',
      ['relation_conditions']
    );

    if (result.rows.length === 0) {
      // Возвращаем значения по умолчанию, если конфиг не найден
      return {
        first_low: 0,
        first_high: 2000,
        second_low: 2000,
        second_high: 20000,
        third_low: 20000,
        third_high: 40000,
        forth_low: 40000,
      };
    }

    return result.rows[0].data as LevelConditions;
  } catch (error) {
    console.error('Error fetching level conditions:', error);
    return null;
  } finally {
    client.release();
  }
}

export default async function ConditionsManagement() {
  const conditions = await getLevelConditions();

  if (!conditions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Не удалось загрузить настройки условий. Проверьте подключение к базе данных.</p>
        </div>
      </div>
    );
  }

  return <ConditionsClient initialConditions={conditions} />;
}