// app/api/admin/relations/route.ts
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
    const result = await client.query(`
      SELECT 
        r.*,
        i.tg_username as initiator_username,
        i.chat_id as initiator_chat_id,
        fi.tg_username as first_inspector_username,
        si.tg_username as second_inspector_username,
        ti.tg_username as third_inspector_username,
        foi.tg_username as forth_inspector_username
      FROM relations r
      LEFT JOIN users i ON r.initiator_id = i.id
      LEFT JOIN users fi ON r.first_inspector_id = fi.id
      LEFT JOIN users si ON r.second_inspector_id = si.id
      LEFT JOIN users ti ON r.third_inspector_id = ti.id
      LEFT JOIN users foi ON r.forth_inspector_id = foi.id
      ORDER BY i.tg_username
    `);
    
    const relations = result.rows.map(row => ({
      id: row.id,
      initiator_id: row.initiator_id,
      first_inspector_id: row.first_inspector_id,
      second_inspector_id: row.second_inspector_id,
      third_inspector_id: row.third_inspector_id,
      forth_inspector_id: row.forth_inspector_id,
      initiator: { 
        id: row.initiator_id, 
        tg_username: row.initiator_username,
        chat_id: row.initiator_chat_id,
      },
      first_inspector: row.first_inspector_id ? { 
        id: row.first_inspector_id, 
        tg_username: row.first_inspector_username,
      } : null,
      second_inspector: row.second_inspector_id ? { 
        id: row.second_inspector_id, 
        tg_username: row.second_inspector_username,
      } : null,
      third_inspector: row.third_inspector_id ? { 
        id: row.third_inspector_id, 
        tg_username: row.third_inspector_username,
      } : null,
      forth_inspector: row.forth_inspector_id ? { 
        id: row.forth_inspector_id, 
        tg_username: row.forth_inspector_username,
      } : null,
    }));
    
    return NextResponse.json(relations);
  } catch (error) {
    console.error('Error fetching relations:', error);
    return NextResponse.json({ error: 'Failed to fetch relations' }, { status: 500 });
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
    const { relations } = await request.json();
    
    await client.query('BEGIN');
    
    // Очищаем существующие отношения
    await client.query('DELETE FROM relations');
    
    // Вставляем новые отношения с указанием всех обязательных полей
    for (const relation of relations) {
      if (relation.initiator_id) {
        await client.query(
          `INSERT INTO relations (
            id,
            initiator_id, 
            first_inspector_id, 
            second_inspector_id, 
            third_inspector_id, 
            forth_inspector_id,
            created_at,
            updated_at
          ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())`,
          [
            relation.initiator_id,
            relation.first_inspector_id,
            relation.second_inspector_id,
            relation.third_inspector_id,
            relation.forth_inspector_id
          ]
        );
      }
    }
    
    await client.query('COMMIT');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating relations:', error);
    return NextResponse.json({ error: 'Failed to update relations' }, { status: 500 });
  } finally {
    client.release();
  }
}