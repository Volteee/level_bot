// app/api/admin/users/roles/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAuth } from '@/utils/check_auth';

export async function PUT(request: Request) {
  const resp = await checkAuth(request)
    if (resp) {
      return resp
    }
  const client = await pool.connect();
  try {
    const { users } = await request.json();
    
    await client.query('BEGIN');
    
    for (const user of users) {
      await client.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        [user.role, user.id]
      );
    }
    
    await client.query('COMMIT');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating roles:', error);
    return NextResponse.json({ error: 'Failed to update roles' }, { status: 500 });
  } finally {
    client.release();
  }
}

// Добавляем другие методы для этого маршрута
export async function GET(request:Request) {
  const resp = await checkAuth(request)
  if (resp) {
    return resp
  }
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, tg_username, role, chat_id 
      FROM users 
      ORDER BY tg_username
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  } finally {
    client.release();
  }
}